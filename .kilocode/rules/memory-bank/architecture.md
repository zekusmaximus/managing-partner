# Architecture: Managing Partner

## Application

Next.js App Router provides five routes: dashboard (`/`), finances, HR, clients, and inbox. `Providers` composes the theme, shared session, simulation, tutorial, and responsive `AppShell`. MUI supplies components and layout; Recharts renders charts.

## State and Data Flow

- `SessionContext` owns one versioned browser-local snapshot containing simulation and tutorial state. It validates a save before loading, restores Date fields, and resets both states through New Game.
- `SimulationContext` exposes gameplay actions to components. Pure functions under `src/lib/simulation/` handle month transitions, inbox choices, budget and receivable operations, and financial selectors, allowing deterministic tests.
- Inbox scenarios carry typed subject data, so actions target the employee, client, or opportunity described by the message.
- `TutorialContext` tracks steps and advances month-action steps explicitly. `TutorialOverlay` locates visible targets and supplies an accessible action fallback.

## UI Pattern

`AppShell` renders one full-width top bar and a sidebar below it on desktop. On smaller screens it uses a temporary navigation drawer. Pages provide their own content, while the shell owns navigation and the single Advance Month control.

## Persistence and Testing

Browser storage holds one save for this device; no API, database, or authentication is used. Bun tests cover pure simulation and save behavior. TypeScript, ESLint, and the Next production build are required checks.
