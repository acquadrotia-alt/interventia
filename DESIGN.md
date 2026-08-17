---
version: 1.0
name: interventia-design-system
description: >
  Sistema di design di interventia — gestionale di rapportini, assistenza e
  fatturazione elettronica per tecnici e artigiani. Derivato dal DESIGN.md di
  Stripe (VoltAgent/awesome-design-md, MIT) e adattato al prodotto: inchiostro
  blu-notte al posto del nero, un unico indaco elettrico come colore d'azione,
  una gradient mesh atmosferica sul terzo superiore delle superfici di
  presentazione, bottoni a pillola con padding stretto, e cifre tabulari
  ovunque compaiano denaro, ore o quantita. Le superfici di prodotto (elenchi,
  form, modali) restano su canvas chiaro con hairline fredde: la densita dei
  dati vince sull'aria editoriale.
source: https://github.com/VoltAgent/awesome-design-md — design-md/stripe/DESIGN.md

colors:
  primary: "#533afd"
  primary-deep: "#4434d4"
  primary-press: "#2e2b8c"
  primary-soft: "#665efd"
  primary-subdued: "#b9b9f9"
  primary-tint: "#eef0ff"
  brand-dark-900: "#1c1e54"
  ink: "#0d253d"
  ink-secondary: "#273951"
  ink-mute: "#64748d"
  ink-faint: "#607188"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  on-dark-mute: "#dde1ff"
  canvas: "#ffffff"
  canvas-soft: "#f6f9fc"
  canvas-cream: "#f5e9d4"
  cream-ink: "#5c4318"
  cream-hairline: "#e2cda5"
  hairline: "#e3e8ee"
  hairline-strong: "#cfd9e4"
  hairline-input: "#a8c3de"
  ruby: "#ea2261"
  magenta: "#f96bee"
  lemon: "#9b6829"
  shadow-blue: "#003770"
  whatsapp: "#25d366"
  success: "#0e6245"
  success-bg: "#cbf4c9"
  warning: "#983705"
  warning-bg: "#f8e5b9"
  danger: "#b3093c"
  danger-bg: "#fce9ec"

typography:
  display-xxl:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 56px
    fontWeight: 300
    lineHeight: 1.03
    letterSpacing: -1.4px
  display-xl:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 40px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: -0.8px
  display-lg:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 32px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: -0.64px
  display-md:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 26px
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: -0.4px
  heading-lg:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: -0.3px
  heading-sm:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: -0.15px
  body-lg:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-md:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: -0.1px
  body-tabular:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: -0.3px
    fontFeature: tnum
  button-md:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: -0.1px
  button-sm:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 13.5px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0
  caption:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: -0.2px
  micro-cap:
    fontFamily: "Archivo, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 10.5px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: 0.6px

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 64px

components:
  button-primary-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 9px 18px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 9px 18px
  button-outline-indigo:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 9px 18px
  button-on-dark:
    backgroundColor: "{colors.brand-dark-900}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 9px 18px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 10px 12px
  card-record-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 16px 18px
  card-feature-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 26px 24px
  card-dashboard-mockup:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-tabular}"
    rounded: "{rounded.xl}"
    padding: 0px
  pill-tag-soft:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.primary-deep}"
    typography: "{typography.micro-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    typography: "{typography.micro-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-pending:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning}"
    typography: "{typography.micro-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  nav-bar-on-mesh:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 0px 24px
  modal-panel:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 22px
---

## Overview

interventia ha due tracce, come il sistema da cui deriva.

La **traccia di presentazione** (landing, login, schermate di ingresso) si apre
con la gradient mesh: una fascia atmosferica di crema, arancio sherbet,
lavanda, indaco e rosa rubino distesa sul terzo superiore della pagina. Testo e
mockup di prodotto galleggiano sopra su `{colors.canvas}`. Sotto, la pagina
torna bianca e le fasce esplicative poggiano su `{colors.canvas-soft}`.

La **traccia di prodotto** (rapportini, clienti, agenda, fatture) e una
superficie chiara e densa: righe-record su canvas bianco con hairline
`{colors.hairline}`, importi in cifre tabulari, un solo bottone pieno indaco
per schermata. Qui l'aria editoriale si comprime: chi usa l'app e in cantiere,
con il telefono in mano, e deve leggere una lista di importi al volo.

Il colore ha due ruoli soltanto. **Indaco** (`{colors.primary}` — `#533afd`) e
l'azione: il bottone pieno, il focus ring, il link. **Blu-notte**
(`{colors.ink}` — `#0d253d`) e il testo, sempre — mai nero puro. Rubino,
magenta e crema vivono dentro la mesh e non diventano mai colori di bottone.

**Caratteristiche chiave:**
- Gradient mesh sul terzo superiore di ogni superficie di presentazione. Un
  hero su canvas nudo e fuori marchio.
- Gerarchia a un solo indaco: un bottone pieno per fascia, mai due.
- Display tier in peso 300 con tracking negativo, da -1.4px a -0.4px.
- Cifre tabulari (`tnum`) su ogni importo, ora, quantita e numero documento.
- Bottoni a pillola (`{rounded.pill}`) con padding stretto `9px 18px`.
- Ombre bluastre: ogni elevazione usa `{colors.shadow-blue}` in alpha, mai il
  nero neutro.
- Righe-record al posto delle tabelle: nel prodotto ogni rapportino, cliente o
  appuntamento e una card `{rounded.lg}` cliccabile a tutta larghezza.

## Colors

### Brand & Accent
- **Indaco** (`{colors.primary}` — `#533afd`): CTA piena, focus ring, link.
- **Indaco profondo** (`{colors.primary-deep}` — `#4434d4`): hover della CTA,
  stop intermedio della mesh, testo sui tag indaco tenue.
- **Indaco premuto** (`{colors.primary-press}` — `#2e2b8c`): stato `:active`.
- **Indaco tenue** (`{colors.primary-soft}` — `#665efd`): accenti nei mockup.
- **Indaco velato** (`{colors.primary-subdued}` — `#b9b9f9`): bordo dei tag.
- **Indaco tinta** (`{colors.primary-tint}` — `#eef0ff`): fondo dei tag e alone
  del focus ring.
- **Brand Dark 900** (`{colors.brand-dark-900}` — `#1c1e54`): superfici scure —
  barra demo, bottone `button-on-dark`, chrome dei mockup.
- **Rubino** (`{colors.ruby}` — `#ea2261`), **Magenta** (`{colors.magenta}` —
  `#f96bee`), **Lemon** (`{colors.lemon}` — `#9b6829`): solo stop della mesh.
- **WhatsApp** (`{colors.whatsapp}` — `#25d366`): unica eccezione alla palette.
  E il verde ufficiale del marchio, usato solo sul chip del canale WhatsApp nel
  modale di assistenza, dove la riconoscibilita vale piu della coerenza
  cromatica. Non estenderlo ad altri elementi.

### Surface
- **Canvas** (`{colors.canvas}` — `#ffffff`): fondo di card, modali, input.
- **Canvas Soft** (`{colors.canvas-soft}` — `#f6f9fc`): fondo pagina e fasce.
- **Canvas Cream** (`{colors.canvas-cream}` — `#f5e9d4`): interludio caldo,
  usato per gli avvisi di prova gratuita e le note promozionali.
- **Hairline** (`{colors.hairline}` — `#e3e8ee`): bordo 1px di card e tabelle.
- **Hairline Strong** (`{colors.hairline-strong}` — `#cfd9e4`): bordo dei
  controlli secondari e hover delle righe.
- **Hairline Input** (`{colors.hairline-input}` — `#a8c3de`): bordo dei campi.

### Text
- **Ink** (`{colors.ink}` — `#0d253d`): testo di default. Mai nero.
- **Ink Secondary** (`{colors.ink-secondary}` — `#273951`): testo di supporto.
- **Ink Mute** (`{colors.ink-mute}` — `#64748d`): label, meta, help.
- **Ink Faint** (`{colors.ink-faint}` — `#607188`): placeholder, eyebrow, note.

### Semantic
Vivono solo nel prodotto, mai nel marketing.
- **Success** `{colors.success}` su `{colors.success-bg}` — fatturato, svolto.
- **Warning** `{colors.warning}` su `{colors.warning-bg}` — da fatturare, in
  attesa, scadenza prova vicina.
- **Danger** `{colors.danger}` su `{colors.danger-bg}` — eliminazione, errore
  di accesso, prova scaduta.

## Typography

### Font Family
Sohne e proprietario. Come sostituto open-source si usa **Archivo** (Google
Fonts) ai pesi 300/400/500/600/700: stessa discendenza neo-grottesca
(Akzidenz / Trade Gothic), apertura ampia, e soprattutto un peso 300 reale, che
il display tier richiede. Inter e scartato deliberatamente: e il ripiego di
default di meta del web e non da carattere al prodotto. `tnum` va applicato per
elemento sui contenuti numerici, non globalmente.

### Hierarchy

| Token | Size | Weight | Tracking | Uso |
|---|---|---|---|---|
| `{typography.display-xxl}` | 56px | 300 | -1.4px | Titolo hero |
| `{typography.display-xl}` | 40px | 300 | -0.8px | Apertura di sezione |
| `{typography.display-lg}` | 32px | 300 | -0.64px | Titolo di pagina |
| `{typography.display-md}` | 26px | 300 | -0.4px | Titolo di card larga |
| `{typography.heading-lg}` | 20px | 400 | -0.3px | Testata di modale |
| `{typography.heading-sm}` | 16px | 500 | -0.15px | Titolo di feature card |
| `{typography.body-lg}` | 16px | 400 | 0 | Lead di marketing |
| `{typography.body-md}` | 15px | 400 | -0.1px | Corpo UI di default |
| `{typography.body-tabular}` | 15px | 500 | -0.3px | Importi e numeri (`tnum`) |
| `{typography.button-md}` | 15px | 500 | -0.1px | Etichetta pillola |
| `{typography.caption}` | 13px | 400 | -0.2px | Help, meta, label |
| `{typography.micro-cap}` | 10.5px | 600 | 0.6px | Eyebrow maiuscolo, badge |

### Principles
- **Il peso 300 e il marchio, ma solo in display.** I titoli restano a 300 con
  tracking negativo. Nel prodotto il corpo sale a 400/500: a 15px il peso 300
  su liste dense diventa illeggibile alla luce del sole, e questa app si usa
  fuori. E l'unica deviazione consapevole dal sistema d'origine.
- **Tracking negativo proporzionale.** -1.4px a 56px, che scala fino a -0.1px a
  15px. E la firma tipografica.
- **Cifre tabulari sui numeri.** Ogni cella con euro, ore, quantita, numero di
  rapportino o di fattura usa `tnum`. Le colonne di importi devono incolonnarsi
  a occhio senza tabella.
- **Mai maiuscolo se non in `{typography.micro-cap}`.** Le eyebrow e i badge
  sono gli unici testi in maiuscoletto.

## Layout

### Spacing System
- **Unita base**: 8px, con sotto-token 2/4/12 per il lavoro fine.
- **Padding di sezione**: 64–96px sulle superfici di presentazione; 32–40px sul
  prodotto.
- **Padding interno delle card**: 26px sulle feature card, 16–18px sulle
  righe-record, 22px nelle modali.
- **Gap tra righe-record**: 10px. E una lista, non una tabella: lo stacco fa il
  lavoro che farebbero i bordi.

### Grid & Container
- Prodotto: contenitore centrato a 1080px, padding laterale 24px (16px mobile).
- Presentazione: contenitore a 1040px con la mesh estesa da bordo a bordo.
- Le griglie di feature collassano `auto-fit minmax(258px, 1fr)`.
- I form usano griglie `1fr 1fr` e `1fr 1fr 1fr` che collassano a colonna
  singola sotto 640px.

### Whitespace Philosophy
Sulla presentazione lo stacco tra sezioni tende a 96px. Sul prodotto si
comprime a 28–40px: l'utente confronta e agisce, non legge.

## Elevation & Depth

| Livello | Trattamento | Uso |
|---|---|---|
| 0 | Piatto, solo hairline | Righe-record, card di default |
| 1 | `0 1px 3px rgba(0,55,112,.08)` | Sollevamento su bianco |
| 2 | `0 8px 24px rgba(0,55,112,.08), 0 2px 6px rgba(0,55,112,.04)` | Pannelli flottanti, topbar in scroll |
| 3 | `0 24px 48px rgba(0,55,112,.12), 0 4px 10px rgba(0,55,112,.06)` | Modali, drawer, mockup dell'hero |
| mesh | Gradient mesh atmosferica | Il vero sistema di profondita della presentazione |

Le ombre sono **sempre** blu (`{colors.shadow-blue}` in alpha), mai nere: e cio
che tiene insieme il grigio-blu del sistema.

## Shapes

| Token | Valore | Uso |
|---|---|---|
| `{rounded.xs}` | 4px | Chrome di tabella |
| `{rounded.sm}` | 6px | Campi form, search |
| `{rounded.md}` | 8px | Banner, toolbar, avatar |
| `{rounded.lg}` | 12px | Righe-record, card, feature card |
| `{rounded.xl}` | 16px | Modali, drawer, mockup |
| `{rounded.pill}` | 9999px | Tutti i bottoni, tag, badge, tab |

## Components

### Buttons
**`button-primary-pill`** — la CTA dominante. Fondo `{colors.primary}`, testo
`{colors.on-primary}`, `{rounded.pill}`, padding `9px 18px`. Hover
`{colors.primary-deep}`, active `{colors.primary-press}`. Una sola per fascia.

**`button-secondary`** — l'azione neutra. Fondo `{colors.canvas}`, testo
`{colors.ink}`, bordo 1px `{colors.hairline-strong}`, stessa geometria.

**`button-outline-indigo`** — l'azione costruttiva secondaria (Nuovo cliente,
Nuova richiesta, Nuovo appuntamento). Fondo `{colors.canvas}`, testo e bordo
`{colors.primary}`.

**`button-on-dark`** — su superfici scure o per l'azione di export. Fondo
`{colors.brand-dark-900}`, testo bianco.

Tutti i bottoni: `:active { transform: scale(.985) }` e focus ring a doppio
anello — alone `{colors.canvas}` 2px, poi `{colors.primary}` 2px.

### Cards & Containers
**`card-record-row`** — l'unita atomica del prodotto. Riga cliccabile a tutta
larghezza: data/numero a sinistra in `tnum`, nome e meta al centro, importo e
badge a destra. Bordo `{colors.hairline}`, `{rounded.lg}`. In hover il bordo
passa a `{colors.hairline-strong}`, il fondo a `{colors.canvas-soft}` e la riga
sale di 1px.

**`card-feature-light`** — card esplicativa. `{rounded.lg}`, padding 26px,
icona 42px in un quadrato `{rounded.lg}` su `{colors.primary-tint}`.

**`card-dashboard-mockup`** — il mockup dell'hero. `{rounded.xl}`, elevazione
3, ruotato di 0.5deg, con chrome superiore e righe-record in miniatura dentro.

### Inputs & Forms
**`text-input`** — fondo `{colors.canvas}`, bordo 1px `{colors.hairline-input}`,
`{rounded.sm}`, padding `10px 12px`, testo `{typography.body-md}`. In focus il
bordo passa a `{colors.primary}` con alone 3px `{colors.primary-tint}`.
Altezza minima 40px su mobile.

### Pills, Tags, Badges
**`pill-tag-soft`** — eyebrow indaco su fondo `{colors.primary-tint}`.
**`badge-success`** / **`badge-pending`** — stato del rapportino, sempre a
pillola, sempre in `{typography.micro-cap}`.

### Signature Components
**Gradient Mesh** — quattro-sei blob radiali (crema, sherbet, lavanda, indaco,
rubino, magenta) sfocati e sovrapposti, mascherati in dissolvenza verso il
basso, sul terzo superiore. Non e un gradiente lineare: sono blob organici.

**Riga-record tabulare** — la traduzione nel prodotto del mockup dashboard del
sistema d'origine: importi in `tnum`, badge di stato a destra, hairline sottile.

**Cifre tabulari** — ogni numero che rappresenta denaro o tempo. E il segnale
silenzioso che questa e un'app che tocca la fatturazione.

## Do's and Don'ts

### Do
- Riserva `{colors.primary}` alle CTA piene, ai link e al focus ring.
- Metti la gradient mesh su ogni superficie di ingresso (landing, login).
- Rendi i display tier a peso 300 con tracking negativo.
- Applica `tnum` a ogni importo, ora e numero documento.
- Usa ombre blu (`{colors.shadow-blue}` in alpha), mai nere.
- Mantieni una sola CTA piena per fascia visibile.

### Don't
- Non portare i display sopra il peso 300: l'aria editoriale collassa.
- Non introdurre accenti fuori dagli stop documentati della mesh.
- Non usare l'indaco come colore di testo a dimensione di corpo.
- Non sostituire la pillola con rettangoli arrotondati sui bottoni.
- Non usare il nero (`#000`) o il grigio neutro: tutto il grigio di questo
  sistema e freddo e virato al blu.
- Non rendere un importo senza `tnum`.

## Responsive Behavior

| Nome | Larghezza | Cambiamenti |
|---|---|---|
| Desktop | ≥ 1024px | Hero a due colonne, mesh piena |
| Tablet | 640–1023px | Hero a colonna singola, mockup sotto il testo |
| Mobile | < 640px | Display 56 → 34px, form a colonna singola, brand name nascosto in topbar, mesh ridotta in altezza ma mai rimossa |

### Touch Targets
Bottoni ≥ 40×40px, che salgono a 44px sotto 640px. Campi form a 40px minimi.
Le righe-record sono bersagli pieni: tutta la riga e cliccabile.

### Motion
Transizioni a `cubic-bezier(.2,.7,.2,1)`, 160ms sui controlli e 200–260ms sui
pannelli. Entrata scaglionata delle liste a 40ms di ritardo per riga, massimo
sei scaglioni. Tutto azzerato sotto `prefers-reduced-motion: reduce`.

## Iteration Guide

1. Lavora su un componente alla volta.
2. Cita i token per nome (`{colors.primary}`, `{rounded.pill}`), non i valori.
3. I token vivono in `:root` dentro il componente `Style` di `src/App.jsx`.
4. Ogni nuovo colore va prima aggiunto qui, poi in `:root`, poi usato.
5. Il corpo di default e `{typography.body-md}`; ogni cella numerica e
   `{typography.body-tabular}`.
6. La mesh non e negoziabile sugli hero di ingresso.
