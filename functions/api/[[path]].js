// ============================================================
// interventia — API (Cloudflare Pages Functions + D1)
// Tutte le rotte stanno sotto /api/...
// Sicurezza: password cifrate (PBKDF2), sessioni con cookie,
// isolamento dei dati per azienda imposto dal server.
// Binding richiesto: D1 con nome variabile "DB".
// Variabile d'ambiente richiesta: SETUP_TOKEN (per creare il reseller).
// ============================================================

const COLLEZIONI = ["clienti", "rapportini", "richieste", "fatture", "appuntamenti"];
const SESSION_GIORNI = 30;

const enc = new TextEncoder();

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function b64(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function fromB64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function tokenCasuale() {
  const a = crypto.getRandomValues(new Uint8Array(32));
  return b64(a).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iter = 100000;
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, key, 256);
  return `pbkdf2$${iter}$${b64(salt)}$${b64(new Uint8Array(bits))}`;
}
async function verifyPassword(password, stored) {
  try {
    const [scheme, iterStr, saltB64, hashB64] = String(stored).split("$");
    if (scheme !== "pbkdf2") return false;
    const salt = fromB64(saltB64);
    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: parseInt(iterStr, 10), hash: "SHA-256" }, key, 256);
    const calc = b64(new Uint8Array(bits));
    if (calc.length !== hashB64.length) return false;
    let diff = 0;
    for (let i = 0; i < calc.length; i++) diff |= calc.charCodeAt(i) ^ hashB64.charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}

function leggiCookie(request, nome) {
  const c = request.headers.get("Cookie") || "";
  for (const parte of c.split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nome) return v.join("=");
  }
  return null;
}
function cookieSessione(token, maxAge) {
  const attr = "Path=/; HttpOnly; Secure; SameSite=Lax";
  if (maxAge === 0) return `sessione=; ${attr}; Max-Age=0`;
  return `sessione=${token}; ${attr}; Max-Age=${maxAge}`;
}

async function utenteDaSessione(request, env) {
  const token = leggiCookie(request, "sessione");
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.ruolo, u.azienda_id, u.nome, s.scadenza
     FROM sessioni s JOIN utenti u ON u.id = s.utente_id
     WHERE s.token = ?`
  ).bind(token).first();
  if (!row) return null;
  if (new Date(row.scadenza).getTime() < Date.now()) {
    await env.DB.prepare(`DELETE FROM sessioni WHERE token = ?`).bind(token).run();
    return null;
  }
  return row;
}

function licenzaValida(azienda) {
  if (!azienda) return false;
  if (Number(azienda.attiva) !== 1) return false;
  if (azienda.licenza_scadenza) {
    // scade a fine giornata indicata
    const fine = new Date(azienda.licenza_scadenza + "T23:59:59").getTime();
    if (Date.now() > fine) return false;
  }
  return true;
}

// Dati di esempio precaricati nelle prove demo
function datiDemo() {
  const base = { tipo: "persona", denominazione: "", nome: "", cognome: "", indirizzo: "", cap: "", comune: "", provincia: "", cf: "", piva: "", sdi: "", pec: "", email: "", telefono: "" };
  const C = (id, x) => ({ id, ...base, ...x });
  const clienti = [
    C("c1", { tipo: "persona", nome: "Mario", cognome: "Rossi", indirizzo: "Via Garibaldi 12", cap: "20121", comune: "Milano", provincia: "MI", cf: "RSSMRA75A01F205X", email: "mario.rossi@email.it", telefono: "335 1234567" }),
    C("c2", { tipo: "azienda", denominazione: "Condominio Aurora", indirizzo: "Viale dei Tigli 8", cap: "20133", comune: "Milano", provincia: "MI", cf: "97612340159", email: "amministrazione@condominioaurora.it", telefono: "02 5551234" }),
    C("c3", { tipo: "azienda", denominazione: "Bar Centrale di Bianchi Luca", indirizzo: "Piazza Roma 3", cap: "20019", comune: "Settimo Milanese", provincia: "MI", piva: "04567890961", sdi: "M5UXCR1", pec: "barcentrale@pec.it", telefono: "340 9988776" }),
    C("c4", { tipo: "azienda", denominazione: "Verdi Costruzioni S.r.l.", indirizzo: "Via dell'Industria 45", cap: "20090", comune: "Segrate", provincia: "MI", piva: "09876543210", sdi: "USAL8PV", pec: "verdicostruzioni@pec.it", email: "ufficio@verdicostruzioni.it", telefono: "02 7001122" }),
    C("c5", { tipo: "persona", nome: "Giulia", cognome: "Ferrari", indirizzo: "Via Manzoni 7", cap: "20052", comune: "Monza", provincia: "MB", telefono: "347 5566778" }),
  ];
  const art = (descrizione, prezzo = null) => ({ id: crypto.randomUUID(), descrizione, prezzo });
  const ts = (d) => new Date(d + "T09:00:00").getTime();
  const R = (id, clienteId, numero, data, luogo, descrizione, ore, tariffaOraria, articoli, fatturato, note = "") =>
    ({ id, numero, clienteId, data, luogo, descrizione, ore, tariffaOraria, articoli, note, fatturato, createdAt: ts(data) });
  const rapportini = [
    R("r8", "c5", 8, "2026-06-22", "Bagno", "Sopralluogo per rifacimento impianto bagno", 1, 0, [], false, "Da preventivare"),
    R("r7", "c3", 7, "2026-06-21", "Bagno clienti", "Sostituzione cassetta WC esterna", 1.5, 0, [art("Cassetta esterna con meccanismo", 39.9)], false),
    R("r6", "c2", 6, "2026-06-20", "Lastrico solare", "Controllo e pulizia pluviali e converse", 2, 35, [], false),
    R("r1", "c1", 5, "2026-06-18", "Bagno", "Sostituzione miscelatore lavabo e riparazione scarico", 2, 35, [art("Miscelatore monocomando", 48.5), art("Sifone a bottiglia", 9.9)], false),
    R("r2", "c2", 4, "2026-06-16", "Scala B - cantina", "Riparazione perdita su colonna acqua fredda", 3.5, 35, [art("Tubo multistrato e raccordi", 22), art("Guarnizioni varie", 6.5)], false),
    R("r3", "c3", 3, "2026-06-12", "Cucina", "Disostruzione scarico lavello e sostituzione sifone", 1.5, 40, [art("Sifone doppio inox", 28)], false),
    R("r4", "c4", 2, "2026-06-10", "Cantiere Via Po", "Posa tubazioni bagno appartamento 3", 6, 38, [art("Tubo multistrato 16mm (rotolo)", 65), art("Collettore 2 vie", 34), art("Minuteria e fissaggi", 18)], false),
    R("r5", "c1", 1, "2026-05-28", "Cucina", "Installazione lavastoviglie e attacco acqua", 1, 35, [art("Rubinetto sottolavello", 7.5), art("Tubo di carico", 5)], true),
  ];
  const RI = (id, clienteId, data, descrizione, stato) => ({ id, clienteId, data, descrizione, stato, createdAt: ts(data) });
  const richieste = [
    RI("ri2", "c3", "2026-06-23", "Perde acqua sotto il bancone del bar, serve intervento urgente prima di sabato.", "da_gestire"),
    RI("ri1", "c2", "2026-06-22", "Un condomino segnala scarso flusso d'acqua calda al 2 piano, scala A.", "da_gestire"),
    RI("ri4", "c5", "2026-06-21", "Richiede un preventivo per rifare completamente l'impianto del bagno.", "da_gestire"),
    RI("ri3", "c1", "2026-06-19", "Il rubinetto della cucina gocciola in continuazione.", "svolto"),
    RI("ri5", "c4", "2026-06-17", "Richiesta sopralluogo per nuovo cantiere a Pioltello.", "svolto"),
  ];
  const azienda = {
    denominazione: "Termoidraulica Conti di Marco Conti",
    partitaIva: "12345670961", codiceFiscale: "CNTMRC80A01F205Z", regimeFiscale: "RF01",
    aliquotaIva: 22, aliquoteIva: [22, 10, 4], costoManodopera: 35, aliquotaManodopera: 22, sezionale: "", logo: "",
    indirizzo: "Via dei Mestieri 5", cap: "20128", comune: "Milano", provincia: "MI",
    modalitaPagamento: "MP05", iban: "IT60X0542811101000000123456", numeroProssimo: 1, progressivoInvio: 1,
  };
  const oggi = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const dPlus = (n) => { const x = new Date(oggi); x.setDate(x.getDate() + n); return fmt(x); };
  const appuntamenti = [
    { id: "a1", data: dPlus(0), ora: "09:30", durata: 60, clienteId: "c2", clienteNome: "Condominio Aurora", titolo: "Controllo perdita colonna acqua fredda", luogo: "Scala B - cantina", note: "Portare raccordi multistrato", stato: "da_fare", richiestaId: "", createdAt: Date.now() },
    { id: "a2", data: dPlus(0), ora: "14:00", durata: 90, clienteId: "c3", clienteNome: "Bar Centrale di Bianchi Luca", titolo: "Intervento urgente perdita sotto il bancone", luogo: "Piazza Roma 3", note: "", stato: "da_fare", richiestaId: "ri2", createdAt: Date.now() },
    { id: "a3", data: dPlus(1), ora: "10:00", durata: 60, clienteId: "c5", clienteNome: "Giulia Ferrari", titolo: "Sopralluogo rifacimento bagno", luogo: "Via Manzoni 7, Monza", note: "Preparare preventivo", stato: "da_fare", richiestaId: "ri4", createdAt: Date.now() },
  ];
  return { clienti, rapportini, richieste, appuntamenti, azienda };
}

// Genera un calendario ICS (iCalendar) dagli appuntamenti
function icsEscape(s) {
  return String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
function icsStampUTC(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}
function icsFloating(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00`;
}
function costruisciICS(nomeAzienda, appuntamenti) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//interventia//agenda//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsEscape("interventia - " + (nomeAzienda || "Agenda"))}`,
  ];
  const stamp = icsStampUTC(Date.now());
  for (const a of appuntamenti) {
    if (!a || !a.data) continue;
    const ora = (a.ora && /^\d{2}:\d{2}$/.test(a.ora)) ? a.ora : "09:00";
    const startMs = Date.parse(`${a.data}T${ora}:00Z`);
    if (isNaN(startMs)) continue;
    const durata = Number(a.durata) > 0 ? Number(a.durata) : 60;
    const endMs = startMs + durata * 60000;
    const titolo = [a.clienteNome, a.titolo].filter(Boolean).map((x) => String(x).trim()).filter(Boolean).join(" - ") || "Appuntamento";
    const descrParts = [];
    if (a.note) descrParts.push(a.note);
    if (a.stato === "fatto") descrParts.push("(svolto)");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${icsEscape(a.id || crypto.randomUUID())}@interventia`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${icsFloating(startMs)}`);
    lines.push(`DTEND:${icsFloating(endMs)}`);
    lines.push(`SUMMARY:${icsEscape(titolo)}`);
    if (a.luogo) lines.push(`LOCATION:${icsEscape(a.luogo)}`);
    if (descrParts.length) lines.push(`DESCRIPTION:${icsEscape(descrParts.join(" "))}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const segs = params.path || [];
  const method = request.method;
  const url = new URL(request.url);

  if (method === "OPTIONS") return new Response(null, { status: 204 });
  if (!env.DB) return json({ error: "Database non collegato (binding DB mancante)" }, 500);

  let body = {};
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    try { body = await request.json(); } catch { body = {}; }
  }

  try {
    // --- Stato/salute ---
    if (segs.length === 0 || segs[0] === "health") {
      const r = await env.DB.prepare("SELECT 1 AS ok").first();
      const reseller = await env.DB.prepare("SELECT COUNT(*) AS n FROM utenti WHERE ruolo='reseller'").first();
      return json({ ok: r?.ok === 1, resellerCreato: (reseller?.n || 0) > 0 });
    }

    // --- Setup iniziale: crea il reseller (una sola volta) ---
    if (segs[0] === "setup" && method === "POST") {
      if (!env.SETUP_TOKEN) return json({ error: "SETUP_TOKEN non configurato" }, 500);
      if (body.token !== env.SETUP_TOKEN) return json({ error: "Token di setup errato" }, 403);
      const giaPresente = await env.DB.prepare("SELECT COUNT(*) AS n FROM utenti WHERE ruolo='reseller'").first();
      if ((giaPresente?.n || 0) > 0) return json({ error: "Reseller gia esistente" }, 409);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!email || password.length < 8) return json({ error: "Email valida e password (min 8 caratteri) richieste" }, 400);
      const id = crypto.randomUUID();
      const hash = await hashPassword(password);
      await env.DB.prepare("INSERT INTO utenti (id,email,password_hash,ruolo,nome) VALUES (?,?,?,'reseller',?)")
        .bind(id, email, hash, body.nome || "Reseller").run();
      return json({ ok: true, email });
    }

    // --- Login ---
    if (segs[0] === "login" && method === "POST") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const u = await env.DB.prepare("SELECT * FROM utenti WHERE email = ?").bind(email).first();
      if (!u || !(await verifyPassword(password, u.password_hash))) {
        return json({ error: "Email o password non corretti" }, 401);
      }
      if (u.ruolo === "azienda") {
        const az = await env.DB.prepare("SELECT * FROM aziende WHERE id = ?").bind(u.azienda_id).first();
        if (!licenzaValida(az)) return json({ error: "Licenza scaduta o disattivata" }, 403);
      }
      const token = tokenCasuale();
      const scad = new Date(Date.now() + SESSION_GIORNI * 86400000).toISOString();
      await env.DB.prepare("INSERT INTO sessioni (token,utente_id,scadenza) VALUES (?,?,?)").bind(token, u.id, scad).run();
      return json({ ok: true, ruolo: u.ruolo }, 200, { "Set-Cookie": cookieSessione(token, SESSION_GIORNI * 86400) });
    }

    // --- Logout ---
    if (segs[0] === "logout" && method === "POST") {
      const token = leggiCookie(request, "sessione");
      if (token) await env.DB.prepare("DELETE FROM sessioni WHERE token = ?").bind(token).run();
      return json({ ok: true }, 200, { "Set-Cookie": cookieSessione("", 0) });
    }

    // --- Feed calendario ICS (pubblico, protetto da token) per Google Calendar ---
    if (segs[0] === "ics" && method === "GET") {
      const token = url.searchParams.get("token") || "";
      const vuoto = costruisciICS("Agenda", []);
      if (!token) return new Response(vuoto, { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
      const az = await env.DB.prepare("SELECT id, denominazione FROM aziende WHERE cal_token = ?").bind(token).first();
      if (!az) return new Response(vuoto, { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
      const r = await env.DB.prepare("SELECT dati FROM appuntamenti WHERE azienda_id = ?").bind(az.id).all();
      const items = (r.results || []).map((x) => { try { return JSON.parse(x.dati); } catch { return null; } }).filter(Boolean);
      const ics = costruisciICS(az.denominazione, items);
      return new Response(ics, {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": 'inline; filename="interventia.ics"',
          "Cache-Control": "no-cache",
        },
      });
    }

    // --- Registrazione prova gratuita (demo pubblica, 7 giorni) ---
    if (segs[0] === "register" && method === "POST") {
      const denom = String(body.denominazione || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!denom || !email.includes("@") || password.length < 8)
        return json({ error: "Inserisci denominazione, un'email valida e una password di almeno 8 caratteri" }, 400);
      const esiste = await env.DB.prepare("SELECT id FROM utenti WHERE email = ?").bind(email).first();
      if (esiste) return json({ error: "Esiste gia un account con questa email" }, 409);

      const GIORNI_DEMO = 7;
      const scadDemo = new Date(Date.now() + GIORNI_DEMO * 86400000).toISOString().slice(0, 10); // YYYY-MM-DD
      const aid = crypto.randomUUID();
      const uidNuovo = crypto.randomUUID();
      const hash = await hashPassword(password);
      const demo = datiDemo();
      const aziendaDati = { ...demo.azienda, denominazione: denom, demo: true, demoInizio: new Date().toISOString().slice(0, 10) };

      const stmts = [
        env.DB.prepare("INSERT INTO aziende (id,denominazione,dati,licenza_scadenza,attiva) VALUES (?,?,?,?,1)")
          .bind(aid, denom, JSON.stringify(aziendaDati), scadDemo),
        env.DB.prepare("INSERT INTO utenti (id,email,password_hash,ruolo,azienda_id,nome) VALUES (?,?,?,'azienda',?,?)")
          .bind(uidNuovo, email, hash, aid, denom),
      ];
      for (const coll of ["clienti", "rapportini", "richieste", "appuntamenti"]) {
        for (const item of demo[coll]) {
          stmts.push(env.DB.prepare(`INSERT INTO ${coll} (id,azienda_id,dati) VALUES (?,?,?)`)
            .bind(String(item.id), aid, JSON.stringify(item)));
        }
      }
      await env.DB.batch(stmts);

      // login automatico subito dopo la registrazione
      const token = tokenCasuale();
      const sessScad = new Date(Date.now() + SESSION_GIORNI * 86400000).toISOString();
      await env.DB.prepare("INSERT INTO sessioni (token,utente_id,scadenza) VALUES (?,?,?)").bind(token, uidNuovo, sessScad).run();
      return json({ ok: true, ruolo: "azienda", scadenzaDemo: scadDemo }, 200, { "Set-Cookie": cookieSessione(token, SESSION_GIORNI * 86400) });
    }

    // Da qui in poi serve l'autenticazione
    const me = await utenteDaSessione(request, env);
    if (!me) return json({ error: "Non autenticato" }, 401);

    // --- Chi sono ---
    if (segs[0] === "me" && method === "GET") {
      let azienda = null;
      if (me.azienda_id) {
        const az = await env.DB.prepare("SELECT id,denominazione,licenza_scadenza,attiva FROM aziende WHERE id = ?").bind(me.azienda_id).first();
        azienda = az || null;
      }
      return json({ id: me.id, email: me.email, ruolo: me.ruolo, nome: me.nome, azienda });
    }

    // --- Gestione aziende/licenze (solo reseller) ---
    if (segs[0] === "aziende") {
      if (me.ruolo !== "reseller") return json({ error: "Riservato al reseller" }, 403);

      if (method === "GET") {
        const r = await env.DB.prepare(
          `SELECT a.id,a.denominazione,a.licenza_scadenza,a.attiva,a.creata_il,
                  (SELECT email FROM utenti WHERE azienda_id = a.id LIMIT 1) AS email
           FROM aziende a ORDER BY a.creata_il DESC`
        ).all();
        return json({ aziende: r.results || [] });
      }

      if (method === "POST") {
        const denom = String(body.denominazione || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        if (!denom || !email || password.length < 8) return json({ error: "Denominazione, email e password (min 8) richieste" }, 400);
        const esiste = await env.DB.prepare("SELECT id FROM utenti WHERE email = ?").bind(email).first();
        if (esiste) return json({ error: "Email gia in uso" }, 409);
        const aid = crypto.randomUUID();
        const uid = crypto.randomUUID();
        const hash = await hashPassword(password);
        await env.DB.batch([
          env.DB.prepare("INSERT INTO aziende (id,denominazione,dati,licenza_scadenza,attiva) VALUES (?,?,?,?,1)")
            .bind(aid, denom, "{}", body.licenzaScadenza || null),
          env.DB.prepare("INSERT INTO utenti (id,email,password_hash,ruolo,azienda_id,nome) VALUES (?,?,?,'azienda',?,?)")
            .bind(uid, email, hash, aid, denom),
        ]);
        return json({ ok: true, aziendaId: aid });
      }
    }

    if (segs[0] === "aziende" && segs[1]) {
      if (me.ruolo !== "reseller") return json({ error: "Riservato al reseller" }, 403);
      const aid = segs[1];
      if (method === "PATCH") {
        if (body.attiva !== undefined)
          await env.DB.prepare("UPDATE aziende SET attiva = ? WHERE id = ?").bind(body.attiva ? 1 : 0, aid).run();
        if (body.licenzaScadenza !== undefined)
          await env.DB.prepare("UPDATE aziende SET licenza_scadenza = ? WHERE id = ?").bind(body.licenzaScadenza || null, aid).run();
        return json({ ok: true });
      }
      if (method === "DELETE") {
        await env.DB.batch([
          env.DB.prepare("DELETE FROM clienti WHERE azienda_id = ?").bind(aid),
          env.DB.prepare("DELETE FROM rapportini WHERE azienda_id = ?").bind(aid),
          env.DB.prepare("DELETE FROM richieste WHERE azienda_id = ?").bind(aid),
          env.DB.prepare("DELETE FROM appuntamenti WHERE azienda_id = ?").bind(aid),
          env.DB.prepare("DELETE FROM fatture WHERE azienda_id = ?").bind(aid),
          env.DB.prepare("DELETE FROM utenti WHERE azienda_id = ?").bind(aid),
          env.DB.prepare("DELETE FROM aziende WHERE id = ?").bind(aid),
        ]);
        return json({ ok: true });
      }
    }

    // --- URL del calendario ICS dell'azienda (per abbonarsi da Google) ---
    if (segs[0] === "agenda" && segs[1] === "url" && method === "GET") {
      if (me.ruolo !== "azienda" || !me.azienda_id) return json({ error: "Solo per utenti azienda" }, 403);
      const row = await env.DB.prepare("SELECT cal_token FROM aziende WHERE id = ?").bind(me.azienda_id).first();
      let token = row && row.cal_token;
      if (!token) {
        token = tokenCasuale();
        await env.DB.prepare("UPDATE aziende SET cal_token = ? WHERE id = ?").bind(token, me.azienda_id).run();
      }
      return json({ url: `${url.origin}/api/ics?token=${token}` });
    }

    // --- Impostazioni azienda (profilo/fatturazione) dell'utente azienda ---
    if (segs[0] === "azienda") {
      if (me.ruolo !== "azienda" || !me.azienda_id) return json({ error: "Solo per utenti azienda" }, 403);
      if (method === "GET") {
        const az = await env.DB.prepare("SELECT denominazione,dati FROM aziende WHERE id = ?").bind(me.azienda_id).first();
        let dati = {};
        try { dati = az?.dati ? JSON.parse(az.dati) : {}; } catch {}
        return json({ azienda: { denominazione: az?.denominazione || "", ...dati } });
      }
      if (method === "PUT") {
        const obj = body && typeof body === "object" ? body : {};
        const denom = obj.denominazione || "";
        await env.DB.prepare("UPDATE aziende SET denominazione = ?, dati = ? WHERE id = ?")
          .bind(denom, JSON.stringify(obj), me.azienda_id).run();
        return json({ ok: true });
      }
    }

    // --- Dati (clienti/rapportini/richieste/fatture) isolati per azienda ---
    if (segs[0] === "data" && segs[1]) {
      if (me.ruolo !== "azienda" || !me.azienda_id) return json({ error: "Solo per utenti azienda" }, 403);
      const coll = segs[1];
      if (!COLLEZIONI.includes(coll)) return json({ error: "Collezione non valida" }, 400);

      if (method === "GET") {
        const r = await env.DB.prepare(`SELECT dati FROM ${coll} WHERE azienda_id = ?`).bind(me.azienda_id).all();
        const arr = (r.results || []).map((x) => {
          try { return JSON.parse(x.dati); } catch { return null; }
        }).filter(Boolean);
        return json({ items: arr });
      }

      if (method === "PUT") {
        const arr = Array.isArray(body.items) ? body.items : [];
        const stmts = [env.DB.prepare(`DELETE FROM ${coll} WHERE azienda_id = ?`).bind(me.azienda_id)];
        for (const item of arr) {
          const id = String(item?.id || crypto.randomUUID());
          stmts.push(env.DB.prepare(`INSERT INTO ${coll} (id,azienda_id,dati) VALUES (?,?,?)`)
            .bind(id, me.azienda_id, JSON.stringify(item)));
        }
        await env.DB.batch(stmts);
        return json({ ok: true, salvati: arr.length });
      }
    }

    return json({ error: "Rotta non trovata" }, 404);
  } catch (e) {
    return json({ error: "Errore server", dettaglio: String(e && e.message || e) }, 500);
  }
}
