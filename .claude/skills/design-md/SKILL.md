---
name: design-md
description: Sistema di design di interventia (DESIGN.md nella root). Usare SEMPRE prima di scrivere o modificare qualunque UI del progetto — CSS, componenti React, template HTML di stampa, landing, login, form, modali, badge, bottoni. Trigger - "restauro grafico", "cambia i colori", "nuova schermata", "nuovo componente", "sistema il layout", "aggiungi un bottone/badge/card", "grafica", "stile", "design", "look". Contiene i token (colori, tipografia, raggi, spaziature, elevazioni) e le regole d'uso derivate dal DESIGN.md di Stripe della collezione VoltAgent/awesome-design-md.
---

# DESIGN.md di interventia

## Come si usa

1. **Leggi `DESIGN.md` nella root del progetto prima di toccare qualunque UI.**
   È il contratto: i token del frontmatter YAML sono la fonte di verità, la
   prosa sotto spiega quando e come applicarli.
2. I token sono già implementati come variabili CSS in `:root`, dentro il
   componente `Style` in `src/App.jsx`. Usa `var(--nome-token)`, mai un valore
   esadecimale scritto a mano.
3. Se serve un colore che non esiste: aggiungilo prima a `DESIGN.md`, poi a
   `:root`, poi usalo. Mai l'ordine inverso.

## Mappa token → variabile CSS

| DESIGN.md | CSS |
|---|---|
| `{colors.primary}` | `--primary` |
| `{colors.primary-deep}` / `-press` / `-soft` / `-subdued` / `-tint` | `--primary-deep` / `--primary-press` / `--primary-soft` / `--primary-subdued` / `--primary-tint` |
| `{colors.brand-dark-900}` | `--brand-dark` |
| `{colors.ink}` / `ink-secondary` / `ink-mute` / `ink-faint` | `--ink` / `--ink-2` / `--muted` / `--faint` |
| `{colors.canvas}` / `canvas-soft` / `canvas-cream` | `--surface` / `--bg` / `--cream` |
| `{colors.hairline}` / `hairline-strong` / `hairline-input` | `--line` / `--line-strong` / `--line-input` |
| `{colors.success}` / `warning` / `danger` (+ `-bg`) | `--green` / `--amber` / `--danger` (+ `-soft`) |
| `{rounded.sm/md/lg/xl/pill}` | `--r-sm` / `--r-md` / `--r-lg` / `--r-xl` / `--r-pill` |
| elevazioni 1/2/3 | `--sh-sm` / `--sh-md` / `--sh-lg` |

## Le sei regole che non si violano

1. **Un solo bottone pieno indaco per fascia visibile.** Tutto il resto è
   `.btn` (neutro) o `.btn-accent` (contorno indaco).
2. **Il testo è blu-notte, mai nero.** `#000` e i grigi neutri sono banditi:
   ogni grigio di questo sistema è freddo, virato al blu.
3. **`tnum` su ogni numero** che sia denaro, ore, quantità, numero di
   rapportino o di fattura. In pratica: classe `.num`.
4. **I display tier restano a peso 300** con tracking negativo. Il corpo del
   prodotto sta a 400/500 — è la deviazione documentata, non estenderla ai
   titoli.
5. **Bottoni, tag e badge sono a pillola** (`--r-pill`), mai rettangoli
   arrotondati.
6. **Le ombre sono blu** (`rgba(0,55,112,α)`), mai nere.

## Superfici di ingresso

Landing e login portano la **gradient mesh** sul terzo superiore (`.mesh`,
blob radiali sfocati e mascherati). Un hero su fondo nudo è fuori marchio.

## Origine

Derivato da `design-md/stripe/DESIGN.md` della collezione
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
(MIT), adattato al dominio di interventia. Per cambiare linguaggio visivo si
sostituisce il frontmatter di `DESIGN.md` con quello di un'altra voce della
collezione e si riallineano le variabili in `:root`: il resto del CSS è scritto
solo in termini di token.
