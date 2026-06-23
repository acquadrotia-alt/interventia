// ============================================================
// interventia — API (Cloudflare Pages Functions + D1)
// Tutte le rotte stanno sotto /api/...
// Sicurezza: password cifrate (PBKDF2), sessioni con cookie,
// isolamento dei dati per azienda imposto dal server.
// Binding richiesto: D1 con nome variabile "DB".
// Variabile d'ambiente richiesta: SETUP_TOKEN (per creare il reseller).
// ============================================================

const COLLEZIONI = ["clienti", "rapportini", "richieste", "fatture"];
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

export async function onRequest(context) {
  const { request, env, params } = context;
  const segs = params.path || [];
  const method = request.method;

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
          env.DB.prepare("DELETE FROM fatture WHERE azienda_id = ?").bind(aid),
          env.DB.prepare("DELETE FROM utenti WHERE azienda_id = ?").bind(aid),
          env.DB.prepare("DELETE FROM aziende WHERE id = ?").bind(aid),
        ]);
        return json({ ok: true });
      }
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
