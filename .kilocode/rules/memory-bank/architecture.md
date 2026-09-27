# Architecture: Managing Partner

## Application

Next.js App Router provides five routes: dashboard (`/`), finances, HR, clients, and inbox. `Providers` composes the theme, shared session, simulation, tutorial, and responsive `AppShell`. MUI supplies components and layout; Recharts renders charts.

## State and Data Flow

- `SessionContext` owns one versioned browser-local snapshot containing simulation and tutorial state. It validates a save before loading, restores Date fields, migrates version 1 pooled receivables to an unassigned account, and resets both states through New Game. Version 1 and 2 cash histories retain unknown opening cash and unclassified residual movements; version 1–3 saves migrate to version 4 with zero opening tax debt because earlier versions had no tax payable ledger.
- `SimulationContext` exposes gameplay actions to components. Pure functions under `src/lib/simulation/` handle month transitions, inbox choices, budget and receivable operations, and financial selectors, allowing deterministic tests.
- Receivable accounts hold per-client aging buckets. Aggregate `arAging` is derived from them; former-client balances persist, and unknown opening or migrated balances remain explicitly unassigned.
- Inbox scenarios carry typed subject data, so actions target the employee, client, or opportunity described by the message. Generation is testable with injected random, ID, and time functions. Pending subject decisions are deduplicated and retained beyond the normal 20-message history limit. Resolved messages persist the selected choice and a summary of its actual outcome.
- Financial history stores opening cash, recurring cash paid, and signed movements for one-time operating costs, equipment, tax payments, partner distributions, and line-of-credit principal. The January opening entry is a P&L run-rate snapshot with no recurring cash payment. The cash waterfall reconciles these recorded movements to the closing balance.
- A fictional estimated tax expense is booked on positive pretax profit when a month opens. The unpaid principal and quarterly late charge are held in `taxPosition`; only payments move cash. The estimate is not revised when later actions alter that month’s P&L.
- `TutorialContext` tracks steps and advances month-action steps explicitly. `TutorialOverlay` locates visible targets, supplies an accessible action fallback, and recognizes checkpoints that the game calendar has already passed.

## UI Pattern

`AppShell` renders one full-width top bar and a sidebar below it on desktop. On smaller screens it uses a temporary navigation drawer. Pages provide their own content, while the shell owns navigation and the single Advance Month control.

## Persistence and Testing

Browser storage holds one save for this device; no API, database, or authentication is used. Bun tests cover pure simulation, scenario generation, tutorial dates, and save behavior. TypeScript, ESLint, and the Next production build are required checks. The tax rules are fictional game estimates, not real-world tax calculations.
