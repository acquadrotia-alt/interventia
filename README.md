# interventia — pubblicazione su Cloudflare Pages

Questo è il progetto pronto per andare online. È una normale app **Vite + React**.
I dati vengono salvati con **localStorage** del browser (non più `window.storage`),
quindi funziona su qualsiasi hosting statico.

---

## ⚠️ Cose importanti da sapere

- **I dati stanno nel browser, sul dispositivo.** Ogni utente vede solo i propri
  dati, e solo sul computer/telefono dove li ha inseriti. Se cambia dispositivo o
  svuota la cache del browser, i dati non ci sono più. Per avere dati condivisi e
  al sicuro su più dispositivi serve un database/backend (passo successivo).
- **Login e licenze sono solo "di facciata".** La password e la gestione licenze
  girano dentro il browser: vanno bene come blocco visivo, ma **non** sono una
  protezione vera. Per vendere licenze sul serio serve un piccolo server che
  validi le password. Posso aiutarti a farlo quando vuoi.

---

## Passo 0 — Cosa ti serve

- Un account gratuito su Cloudflare (https://dash.cloudflare.com).
- **Node.js 18 o superiore** installato sul tuo computer (https://nodejs.org).

---

## Opzione A (consigliata) — Pubblica da GitHub, build automatica

1. Crea un repository su GitHub e carica dentro **tutta questa cartella**.
2. Su Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
3. Seleziona il repository.
4. Imposta i parametri di build:
   - **Framework preset:** Vite (oppure "None")
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. **Save and Deploy.** In un paio di minuti avrai un indirizzo tipo
   `https://interventia.pages.dev`.

Da qui in poi, ogni volta che aggiorni il codice su GitHub, Cloudflare ripubblica
da solo.

---

## Opzione B — Build sul tuo PC e caricamento manuale (Direct Upload)

1. Apri il terminale dentro questa cartella e lancia:
   ```
   npm install
   npm run build
   ```
   Si crea una cartella **`dist`**.
2. Su Cloudflare: **Workers & Pages → Create → Pages → Upload assets**.
3. Trascina dentro **il contenuto della cartella `dist`** (non la cartella, ma ciò
   che c'è dentro) e pubblica.

---

## Provare in locale prima di pubblicare

```
npm install
npm run dev
```
Apri l'indirizzo che compare (di solito http://localhost:5173).

---

## Dominio personalizzato (facoltativo)

Su Cloudflare Pages → progetto → **Custom domains** puoi collegare un dominio tuo
(es. `app.tuonome.it`) gratuitamente.
