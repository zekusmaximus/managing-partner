# Architecture: Managing Partner

## Application

Next.js App Router provides five routes: dashboard (`/`), finances, HR, clients, and inbox. `Providers` composes the theme, shared session, simulation, tutorial, and responsive `AppShell`. MUI supplies components and layout; Recharts renders charts.

## State and Data Flow

- `SessionContext` owns one versioned browser-local snapshot containing simulation and tutorial state. It validates a save before loading, restores Date fields, migrates version 1 pooled receivables to an unassigned account, and resets both states through New Game. Version 1 and 2 cash histories retain unknown opening cash and unclassified residual movements; version 1–3 saves migrate to version 4 with zero opening tax debt because earlier versions had no tax payable ledger.
- `SimulationContext` exposes gameplay actions to components. Pure functions under `src/lib/simulation/` handle month transitions, inbox choices, budget and receivable operations, and financial selectors, allowing deterministic tests.
- `clientService.ts` computes billable client slots from efficacy, client affinity, and burnout; support staff multiply effective capacity. The monthly transition compares capacity to the active client roster, adjusts satisfaction, and scales renewal odds. Client acquisition and feedback are available through inbox outcomes rather than direct Clients-page controls.
- Receivable accounts hold per-client aging buckets. Aggregate `arAging` is derived from them; former-client balances persist, and unknown opening or migrated balances remain explicitly unassigned.
- Inbox scenarios carry typed subject data, so actions target the employee, client, or opportunity described by the message. Generation is testable with injected random, ID, and time functions. Pending subject decisions are deduplicated and retained beyond the normal 20-message history limit. Resolved messages persist the selected choice and a summary of its actual outcome.
- Financial history stores opening cash, recurring cash paid, and signed movements for one-time operating costs, equipment, tax payments, partner distributions, and line-of-credit principal. The January opening entry is a P&L run-rate snapshot with no recurring cash payment. The cash waterfall reconciles these recorded movements to the closing balance.
- A fictional estimated tax expense is booked on positive pretax profit when a month opens. The unpaid principal and quarterly late charge are held in `taxPosition`; only payments move cash. The estimate is not revised when later actions alter that month’s P&L.
- Manual collections use `lastManualCollection` to permit one attempt per game month. Version 4 saves may lack this additive field; parsing normalizes it to `null`. The save format version is unchanged.
- `lastPartnerIntervention` records one major personal escalation per simulation month. The version 4 loader gives missing markers an explicit null default and converts a legacy `lastClientMeeting` into a spent shared allowance. Current pending complaint and collection choices are re-quoted on load without changing completed outcomes or tutorial step IDs.
- `getWorkloadBurnoutTrend` uses a single pre-update service-coverage snapshot to set bounded monthly burnout; employee efficacy changes only through explicit staff scenarios. Recovery reduces burnout without efficacy gains. The salary transition revalidates against the latest state and the quote previews loaded recurring payroll at the next month advance.
- `getClientMeetingQuote` and `scheduleClientMeeting` share eligibility and exact effects. An active complaint also qualifies, including at satisfaction 70–74. A meeting costs $1,000 as a current-month operating cash/P&L movement, uses the shared partner intervention, raises satisfaction, collects a bounded amount from the client's 31+ day buckets oldest first, and resolves a pending complaint once. Personal collection calls use the same allowance with their own formula and no meeting fee. `getInboxChoiceQuote` guards stale, duplicate, unaffordable, and unavailable complaint/collection actions before any state change.
- Alerts may carry an optional structured action target for reliable deep links; save validation accepts older alerts without it. Dashboard guidance maps warnings to the relevant client, AR, staffing, credit, or budget view. Alert messages are snapshots that players can dismiss after checking current values.
- `TutorialContext` tracks steps and advances month-action steps explicitly. `TutorialOverlay` locates visible targets, supplies an accessible action fallback, and recognizes checkpoints that the game calendar has already passed.

## UI Pattern

`AppShell` renders one full-width top bar and a sidebar below it on desktop. On smaller screens it uses a temporary navigation drawer. Pages provide their own content, while the shell owns navigation and the single Advance Month control.

The phone dashboard shows cash, service coverage, alerts, and the next action before detailed metrics. Finance navigation switches from tabs to a report selector below 900px; the phone P&L uses a month/YTD toggle to keep amount and percentage columns readable.

The Clients page displays a client-specific meeting quote and can open a selected client from a warning or AR row. Finance actions preview their modeled cash, AR, profit, debt, budget, or distribution effects before the player commits.

## Persistence and Testing

Browser storage holds one save for this device; no API, database, or authentication is used. Bun tests cover pure simulation, scenario generation, tutorial dates, and save behavior. TypeScript, ESLint, and the Next production build are required checks. The tax rules are fictional game estimates, not real-world tax calculations.
