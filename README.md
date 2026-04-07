# Pong

> Gioco Pong classico con modalita multiplayer, temi personalizzabili e effetti speciali

[![Licenza MIT](https://img.shields.io/badge/Licenza-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GitHub stars](https://img.shields.io/github/stars/carellonicolo/pongcarello?style=social)](https://github.com/carellonicolo/pongcarello)
[![GitHub issues](https://img.shields.io/github/issues/carellonicolo/pongcarello)](https://github.com/carellonicolo/pongcarello/issues)

## Panoramica

Pong e una rivisitazione moderna del classico gioco arcade, realizzata con tecnologie web contemporanee. L'applicazione offre diverse modalita di gioco — singolo contro CPU, multiplayer locale e sopravvivenza — arricchite da 13 temi grafici, power-up, sistema di particelle, effetti sonori e un commentatore integrato.

Il gioco e altamente personalizzabile: dalla velocita della palla alla sensibilita delle racchette, dai colori ai tasti di controllo, tutto e configurabile per adattarsi alle preferenze del giocatore.

## Funzionalita Principali

- **Modalita di gioco** — Singolo (vs CPU), Locale a 2 giocatori, Sopravvivenza
- **13 temi grafici** — Retro, Minimal, Ocean, Sunset, Matrix, Vaporwave e altri
- **Power-up** — Bonus e malus durante la partita
- **Sistema di particelle** — Effetti visivi all'impatto della palla
- **Effetti sonori** — Audio immersivo con commentatore
- **Personalizzazione completa** — Colori racchette, tasti, velocita, sensibilita, punteggio vincente
- **Difficolta CPU regolabile** — Livelli di intelligenza artificiale dell'avversario
- **Supporto mouse** — Controllo opzionale tramite mouse

## Tech Stack

| Tecnologia | Utilizzo |
|:--|:--|
| ![React](https://img.shields.io/badge/React_18-61dafb?logo=react&logoColor=white) | Framework UI |
| ![TypeScript](https://img.shields.io/badge/TypeScript_5-3178c6?logo=typescript&logoColor=white) | Linguaggio tipizzato |
| ![Vite](https://img.shields.io/badge/Vite_5-646cff?logo=vite&logoColor=white) | Build tool |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06b6d4?logo=tailwindcss&logoColor=white) | Styling |

## Requisiti

- **Node.js** >= 18
- **npm** >= 9 (oppure bun)

## Installazione

```bash
git clone https://github.com/carellonicolo/pongcarello.git
cd pongcarello
npm install
npm run dev
```

L'applicazione sara disponibile su `http://localhost:8080`.

## Utilizzo

1. Seleziona la modalita di gioco dal menu principale
2. Personalizza il tema e le impostazioni
3. Gioca usando tastiera o mouse
4. Nei match locali, il secondo giocatore usa tasti dedicati (W/S)

## Struttura del Progetto

```
pongcarello/
├── src/
│   ├── components/     # Componenti React (campo, racchette, menu)
│   ├── lib/            # Motore di gioco e fisica
│   ├── pages/          # Pagine dell'applicazione
│   └── hooks/          # Custom hooks
├── public/             # Asset statici
├── index.html          # Entry point HTML
└── vite.config.ts      # Configurazione Vite
```

## Deploy

```bash
npm run build
```

La cartella `dist/` e deployabile su Cloudflare Pages, Netlify, Vercel o qualsiasi hosting statico.

## Contribuire

I contributi sono benvenuti! Consulta le [linee guida per contribuire](CONTRIBUTING.md) per maggiori dettagli.

## Licenza

Distribuito con licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli completi.

## Autore

**Nicolo Carello**
- GitHub: [@carellonicolo](https://github.com/carellonicolo)
- Website: [nicolocarello.it](https://nicolocarello.it)

---

<sub>Sviluppato con l'ausilio dell'intelligenza artificiale.</sub>

## Progetti Correlati

Questo progetto fa parte di una collezione di strumenti didattici e applicazioni open-source:

| Progetto | Descrizione |
|:--|:--|
| [DFA Visual Editor](https://github.com/carellonicolo/AFS) | Editor visuale per automi DFA |
| [Turing Machine](https://github.com/carellonicolo/Turing-Machine) | Simulatore di Macchina di Turing |
| [Scheduler](https://github.com/carellonicolo/Scheduler) | Simulatore di scheduling CPU |
| [Subnet Calculator](https://github.com/carellonicolo/Subnet) | Calcolatore subnet IPv4/IPv6 |
| [Base Converter](https://github.com/carellonicolo/base-converter) | Suite di conversione multi-funzionale |
| [Gioco del Lotto](https://github.com/carellonicolo/giocodellotto) | Simulatore Lotto e SuperEnalotto |
| [MicroASM](https://github.com/carellonicolo/microasm) | Simulatore assembly |
| [Flow Charts](https://github.com/carellonicolo/flow-charts) | Editor di diagrammi di flusso |
| [Cypher](https://github.com/carellonicolo/cypher) | Toolkit di crittografia |
| [Snake](https://github.com/carellonicolo/snake) | Snake game retro |
| [Calculator](https://github.com/carellonicolo/calculator-carello) | Calcolatrice scientifica |
| [IPSC Score](https://github.com/carellonicolo/IPSC) | Calcolatore punteggi IPSC |
| [Quiz](https://github.com/carellonicolo/quiz) | Piattaforma quiz scolastici |
| [Carello Hub](https://github.com/carellonicolo/carello-hub) | Dashboard educativa |
| [Prof Carello](https://github.com/carellonicolo/prof-carello) | Gestionale lezioni private |
| [DOCSITE](https://github.com/carellonicolo/DOCSITE) | Piattaforma documentale |
