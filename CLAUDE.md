# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## What This Is

**Managing Partner** is a single-player, browser-based **business simulation game**. The
player is the managing partner of a mid-size government relations (GR) / lobbying firm in
Washington, D.C., and makes monthly decisions about finances, staff, clients, and inbox
events to grow the firm's reputation and profitability. It doubles as an educational tool,
with a 34-step interactive tutorial and a searchable industry glossary.

There is **no backend, no database, and no API layer**. The game runs in client-side
React state. One versioned browser-local save holds the simulation and tutorial together;
valid version 1–3 saves migrate to version 4. There are no accounts or cross-device saves.

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) |
| UI runtime | React 19 |
| Language | TypeScript 5 (strict mode) |
| Component library | MUI (Material UI) 7 — primary UI |
| Charts | Recharts 3 |
| Styling | MUI `sx`/theme + Tailwind CSS 4 (available, used sparingly) |
| Package manager | **Bun** (a `bun.lock` is committed; `package-lock.json` also present) |

## Commands

Use **Bun**, not npm/yarn.

```bash
bun install         # install dependencies
bun run dev         # dev server (see note below)
bun run build       # production build
bun run start       # serve production build
bun run lint        # ESLint (eslint-config-next)
bun run typecheck   # tsc --noEmit
bun test            # focused simulation and save tests
```

**Before committing, run `bun test`, `bun run typecheck`, `bun run lint`, and
`bun run build`.** Type errors and lint errors break the build. Most past bugs in this
repo were TypeScript/Next.js server-client-boundary issues caught by these checks.

> Note: In the managed/sandbox environment the dev server is started automatically — do not
> run `bun run dev` / `next dev` yourself there. When working locally, `bun run dev` is fine.

## Project Structure

```
src/
├── app/                       # Next.js App Router (routes + root wiring)
│   ├── layout.tsx             # Root layout, fonts, metadata, wraps <Providers>
│   ├── providers.tsx          # "use client" — theme, session/simulation/tutorial providers, shell, overlays
│   ├── globals.css            # Tailwind import + global styles
│   ├── page.tsx               # Route "/"  → Dashboard
│   ├── finances/page.tsx      # Route "/finances" → 5-tab financial view
│   ├── hr/page.tsx            # Route "/hr"       → staff roster
│   ├── clients/page.tsx       # Route "/clients"  → client relations
│   └── inbox/page.tsx         # Route "/inbox"    → decision inbox
├── components/
│   ├── dashboard/Dashboard.tsx
│   ├── layout/                # AppShell, TopNav, SideNav
│   ├── finances/              # PLStatement, BudgetTracker, ARManager, CashFlowView, PartnerEconomicsView
│   ├── hr/StaffingEconomics.tsx
│   ├── tutorial/              # WelcomeModal, TutorialOverlay, TutorialProgressBar, LearningObjectivesCard
│   └── help/                  # HelpFab, GlossaryDrawer, HelpTooltip
├── context/
│   ├── SessionContext.tsx     # One browser-local snapshot + New Game
│   ├── SimulationContext.tsx  # Component-facing game actions
│   └── TutorialContext.tsx    # Tutorial flow; state stored by SessionContext
├── lib/
│   ├── simulation/           # Pure month transitions, inbox decisions, scenarios, metrics
│   └── session/              # Versioned save validation, migration, tutorial defaults
├── data/                      # Static content (no logic)
│   ├── tutorialSteps.ts       # 34 steps across 4 phases
│   ├── learningObjectives.ts  # 13 objectives + TutorialPhase type
│   ├── glossaryTerms.ts       # 55+ GR industry terms
│   └── contextualHelp.ts      # Help text keyed per metric
└── types/
    └── simulation.ts          # ★ All core interfaces + financial constants + pure helpers
```

The `@/*` path alias maps to `src/*` (see `tsconfig.json`). Always import with `@/...`.

## Architecture & Key Conventions

### 1. SessionContext owns the saved state
`src/context/SessionContext.tsx` owns one snapshot with `SimulationState` and tutorial state.
It loads after client hydration, saves both together, and resets both with New Game.
`src/lib/session/save.ts` validates the data, restores dates, and migrates version 1 pooled
receivables as explicitly unassigned balances. Version 1 and 2 cash histories retain unknown
opening cash on the oldest retained entry and unclassified residual movements in later months.
Valid version 1–3 saves migrate to version 4 with zero opening tax balance; unresolved legacy
tax prompts expire because those saves recorded no tax payable. Keep simulation and tutorial
state in the same snapshot.

`SimulationContext` exposes gameplay actions through `useSimulation()`. Month advancement,
inbox decisions, receivable operations, and financial selectors live in testable functions
under `src/lib/simulation/`; do not move those calculations back into page components.

Exposed actions (from the provider value): `advanceMonth`, `hireEmployee`, `fireEmployee`,
`adjustSalary`, `fundStaffRecovery`, `addClient`, `removeClient`, `updateClientSatisfaction`,
`markInboxMessageRead`, `handleInboxChoice`, `dismissAlert`, `addVendor`, `removeVendor`,
`adjustOperatingCost`, `drawLineOfCredit`, `repayLineOfCredit`, `setPartnerDraw`,
`setBudget`, `writeOffAR`, `collectAR`.

Conventions when extending it:
- Mutations use `setState(prevState => ...)` with **immutable updates** (spread, `map`,
  `filter`) — never mutate `prevState`.
- Actions are wrapped in `useCallback`.
- `advanceMonth()` calls the pure monthly transition: collections and per-client AR
  aging, payroll, operating/vendor costs, partner draw, line-of-credit auto draw/repay,
  budget tracking, reputation recalculation, financial-history snapshot, then alerts
  and inbox messages.
- Monthly history records opening cash, recurring cash paid, and signed cash movements.
  January starts as an opening snapshot: its P&L run rate is booked, but those recurring
  costs have not yet been paid in cash. Manual and automatic credit-line activity,
  distributions, estimated tax payments, equipment purchases, and one-time operating
  costs are recorded in the month they occur.
- Staff recovery is a once-per-month, cash-funded action with its cooldown encoded by a
  `staff-recovery` movement in the current month's history. It adds a one-time P&L cost
  and Payroll budget actual; the version 4 save schema accepts the additional movement
  kind without a new required field or version migration. The full plan covers up to 12
  eligible staff at $1,500 each (-25 burnout, up to +5 efficacy). The targeted plan
  covers up to two at $500 each (-15 burnout, up to +3 efficacy), or one when only
  one is eligible or $500–$999 cash is available. Both plans share the monthly cooldown.
- Expiring client contracts resolve into churn or a positive new 12-month term.
  Contract outcome alerts use simulation-month dates; former-client receivables keep aging
  and collecting after churn.
- Inbox messages carry typed scenario subjects and optional persisted `resolution` feedback.
  Decisions must use the named subject's state and show the actual result, including random
  outcomes and unavailable subjects. A resolved message must not apply twice. Scenario
  generation lives in `src/lib/simulation/scenarios.ts`, accepts injected random, ID, and
  time functions for tests, and avoids duplicate pending decisions about the same subject.
  Month advancement retains all pending decisions even when the normal inbox history fills.
- The game books a fictional 25% estimated tax provision on positive pretax month-opening
  profit. It adds a fictional 2% late charge on unpaid principal at quarter opening, without
  compounding penalties. Payments reduce cash and clear penalties before principal. Later
  same-month decisions can change profit without revising that opening tax estimate.
- `useSimulation()` throws if used outside `SimulationProvider`.

### 2. Types and pure financial logic
`src/types/simulation.ts` holds interfaces, financial constants, and small helpers.
`src/lib/simulation/` holds transitions and shared metrics. Put reusable,
side-effect-free calculations in one of these places rather than inlining them in UI:
- Constants: `BENEFITS_RATE` (0.25), `PAYROLL_TAX_RATE` (0.0765), `HIRING_COST` (5000),
  `SEVERANCE_COST` (2000), staff recovery constants, `AR_COLLECTION_RATES`.
- Helpers: `getEmployeeTotalCost`, `getEmployeeBenefits`, `getEmployeePayrollTax`,
  `getOperatingCostsTotal`, `getARTotal`, `getLOCAvailable`, `getLOCMonthlyInterest`.

`SimulationContext` re-exports types so consumers can import either from
`@/types/simulation` or `@/context/SimulationContext`.

### 3. Server vs. Client Components
Next.js App Router defaults to Server Components. Anything using state, context, hooks
(`useSimulation`, `usePathname`), MUI interactivity, or browser APIs **must** start with
`"use client";`. The shared shell is mounted in `providers.tsx`; route pages supply their
own content. Keep simple route files server-side when possible. Several historical bugs
came from missing client boundaries.

### 4. Global app wiring
`src/app/providers.tsx` (client) composes MUI `ThemeProvider` + `CssBaseline`, then
`SessionProvider` → `SimulationProvider` → `TutorialProvider`, wraps content in `AppShell`,
and mounts the always-on overlays (`WelcomeModal`, `TutorialOverlay`, `HelpFab`).

### 5. Page layout pattern
`AppShell` renders the full-width header above the desktop sidebar. At smaller widths,
`SideNav` becomes a temporary drawer. The shell owns navigation, the date, and the single
Advance Month control; new pages provide content only and add their route to `SideNav`.

### 6. Tutorial system
- `TutorialContext` manages flow (status, current step/phase, completion %, pause/resume).
  `SessionContext` saves tutorial progress with the simulation; the old tutorial-only key
  is discarded.
- Tutorial content is data, not code: edit `src/data/tutorialSteps.ts`. Each step targets a
  page and a CSS `targetSelector` (or `center`), and may require a `navigate` /
  `advance_month` action. Steps reference `learningObjectiveIds` from
  `src/data/learningObjectives.ts`.
- The `TutorialOverlay` spotlights elements by selector — if you change DOM structure that a
  step targets, update the step's `targetSelector`. Tutorial progress stores both the month and
  year at start so a resumed or restarted tutorial does not advance an already-passed month
  checkpoint again. Spotlight keyboard focus stays within the tutorial and permitted target.

### 7. Help & glossary
Searchable glossary lives in `src/data/glossaryTerms.ts`; per-metric help text in
`src/data/contextualHelp.ts`. Add new metrics' help text here and surface it via `HelpTooltip`.

## Domain Model (quick reference)

- **Time**: `month` (1–12) + `year`; quarter = `ceil(month/3)`. Game starts month 1, 2026.
- **Financials**: client fees are recognized as invoiced revenue; collections move cash.
  Receivables age in 4 buckets (current/30/60/90+) per client with collection rates by
  `paymentProfile` (`prompt`/`normal`/`slow`). Former-client balances remain until settled;
  opening and migrated balances with unknown provenance stay unassigned. The aggregate
  `arAging` buckets must equal the sum of the receivable accounts. The line of credit
  auto draws/repays at 8% annual interest.
- **Employees**: roles `Lobbyist | Attorney | Support`; metrics efficacy, burnout, salary,
  clientAffinity. Fully-loaded cost = salary × (1 + 0.25 benefits + 0.0765 FICA).
- **Clients**: types `Trade Association | Corporation | Non-Profit`; satisfaction, monthly
  fee, contract months remaining. Renewals begin a new 12-month term and churn ends billing.
- **Reputation** (0–100): recomputed each month as 60% avg client satisfaction + 40% avg
  employee efficacy, with small random drift.
- **Inbox**: typed scenario events with `choices`; `handleInboxChoice` applies effects once
  and records the selected action and actual outcome for the inbox detail view.
- `financialHistory` keeps the last 12 monthly snapshots (used for dashboard charts and
  cash reconciliation). Hiring, severance, and repairs enter the one-time operating cost
  P&L category; equipment purchases, estimated tax payments, partner distributions, and
  credit-line principal change cash without changing P&L. Tax provisions and late charges
  change P&L and the payable balance without moving cash. Write-offs remain noncash.

The deterministic balance harness is in `src/lib/simulation/balanceHarness.ts`. Run
`bun run scripts/balance-report.ts` for five seeds, three scripted policies, and 24 monthly
advances; see `docs/balance-simulation.md` for the cash-pressure comparison, definitions, and limits.
These runs are simulation checks, not human playtest evidence.

The tax balance and late charge are game estimates, not real-world tax calculations. The cash
projection uses a short recurring run rate and is not a forecast of future decisions or collections.

## Workflow for Changes

1. Make changes on the designated feature branch (see repo/task instructions).
2. Keep component actions in `SimulationContext`, pure transitions and metrics in
   `lib/simulation/`, types and small helpers in `types/simulation.ts`, and static content
   in `data/`.
3. Run `bun test`, `bun run typecheck`, `bun run lint`, and `bun run build` — all must pass.
4. Commit with a clear, descriptive message and push.
5. Do **not** open a pull request unless explicitly asked.

## Related Documentation

- `README.md` — user-facing feature overview, structure, and game mechanics.
- `TODO.md` — phased implementation plan and progress.
- `AGENTS.md` + `.kilocode/` — Kilocode "memory bank" and recipes (e.g.
  `.kilocode/recipes/add-database.md` for adding persistence). `.kilocode/rules/development.md`
  contains the Bun/commit rules echoed above. Keep `.kilocode/rules/memory-bank/context.md`
  reasonably current when architecture, stack, or status changes meaningfully.
