# Technical Context: Managing Partner

## Stack

| Technology | Purpose |
| --- | --- |
| Next.js 16 and React 19 | App Router and UI runtime |
| TypeScript 5 | Types and quality checks |
| MUI 7 and Emotion | Components and theme |
| Recharts 3 | Charts |
| Tailwind CSS 4 | Available utility styling |
| Bun | Package manager and test runner |

## Requirements and Commands

Use Bun for dependency management. If using Node.js directly, Next.js 16 requires Node 20.9 or later. Do not start `bun dev` or `next dev` in the managed sandbox; it supplies the preview.

```bash
bun install
bun test
bun typecheck
bun lint
bun run build
```

## Storage and Integrations

The app uses one version 3 `localStorage` save for the simulation and tutorial. Valid version 1 and 2 saves migrate, preserving pooled historical AR as unassigned and unexplained cash differences as unclassified. The older tutorial-only key is discarded. It has no server API, account system, or database. The optional database recipe applies only if server-side or cross-device persistence is later requested.

## Key Directories

- `src/app/`: routes and root providers
- `src/components/`: layout, dashboard, finance, HR, tutorial, and help UI
- `src/context/`: session, simulation, and tutorial contexts
- `src/lib/simulation/`: pure game transitions and financial calculations
- `src/lib/session/`: save validation, serialization, and tutorial defaults
- `src/types/`: shared simulation types
