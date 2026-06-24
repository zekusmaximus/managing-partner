# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## What This Is

**Managing Partner** is a single-player, browser-based **business simulation game**. The
player is the managing partner of a mid-size government relations (GR) / lobbying firm in
Washington, D.C., and makes monthly decisions about finances, staff, clients, and inbox
events to grow the firm's reputation and profitability. It doubles as an educational tool,
with a 34-step interactive tutorial and a searchable industry glossary.

There is **no backend, no database, and no API layer**. The entire game is client-side
React state held in context and (for tutorial progress only) `localStorage`. Treat the
simulation as a pure in-memory model.

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
```

**Before committing, always run `bun run typecheck` and `bun run lint`.** Type errors and
lint errors break the build. Most past bugs in this repo were TypeScript/Next.js
server-client-boundary issues caught by these checks.

> Note: In the managed/sandbox environment the dev server is started automatically — do not
> run `bun run dev` / `next dev` yourself there. When working locally, `bun run dev` is fine.

## Project Structure

```
src/
├── app/                       # Next.js App Router (routes + root wiring)
│   ├── layout.tsx             # Root layout, fonts, metadata, wraps <Providers>
│   ├── providers.tsx          # "use client" — MUI ThemeProvider + Simulation/Tutorial providers + global overlays
│   ├── globals.css            # Tailwind import + global styles
│   ├── page.tsx               # Route "/"  → Dashboard
│   ├── finances/page.tsx      # Route "/finances" → 5-tab financial view
│   ├── hr/page.tsx            # Route "/hr"       → staff roster
│   ├── clients/page.tsx       # Route "/clients"  → client relations
│   └── inbox/page.tsx         # Route "/inbox"    → decision inbox
├── components/
│   ├── dashboard/Dashboard.tsx
│   ├── layout/                # TopNav, SideNav (shell on every page)
│   ├── finances/              # PLStatement, BudgetTracker, ARManager, CashFlowView, PartnerEconomicsView
│   ├── hr/StaffingEconomics.tsx
│   ├── tutorial/              # WelcomeModal, TutorialOverlay, TutorialProgressBar, LearningObjectivesCard
│   └── help/                  # HelpFab, GlossaryDrawer, HelpTooltip
├── context/
│   ├── SimulationContext.tsx  # ★ Core game state + all mutation logic (~1000 lines)
│   └── TutorialContext.tsx    # Tutorial flow + localStorage persistence
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

### 1. SimulationContext is the single source of truth
`src/context/SimulationContext.tsx` owns the entire game state (`SimulationState`) and every
function that mutates it. **All game logic flows through this file.** Pages and components are
presentational: they read state and call action functions from the `useSimulation()` hook.

Exposed actions (from the provider value): `advanceMonth`, `hireEmployee`, `fireEmployee`,
`adjustSalary`, `addClient`, `removeClient`, `updateClientSatisfaction`,
`markInboxMessageRead`, `handleInboxChoice`, `dismissAlert`, `addVendor`, `removeVendor`,
`adjustOperatingCost`, `drawLineOfCredit`, `repayLineOfCredit`, `setPartnerDraw`,
`setBudget`, `writeOffAR`, `collectAR`.

Conventions when extending it:
- Mutations use `setState(prevState => ...)` with **immutable updates** (spread, `map`,
  `filter`) — never mutate `prevState`.
- Actions are wrapped in `useCallback`.
- `advanceMonth()` is the heart of the game: it runs the monthly tick (collections & AR
  aging, payroll, operating/vendor costs, partner draw, line-of-credit auto draw/repay,
  budget tracking, reputation recalculation, financial-history snapshot) and then
  regenerates `alerts` and `inbox` messages. Keep the numbered step structure intact and add
  new mechanics as additional steps.
- `useSimulation()` throws if used outside `SimulationProvider`.

### 2. Types and pure financial logic live in `src/types/simulation.ts`
This file holds all interfaces **and** the financial constants and pure helper functions.
Put reusable, side-effect-free calculations here rather than inlining them:
- Constants: `BENEFITS_RATE` (0.25), `PAYROLL_TAX_RATE` (0.0765), `HIRING_COST` (5000),
  `SEVERANCE_COST` (2000), `AR_COLLECTION_RATES`.
- Helpers: `getEmployeeTotalCost`, `getEmployeeBenefits`, `getEmployeePayrollTax`,
  `getOperatingCostsTotal`, `getARTotal`, `getLOCAvailable`, `getLOCMonthlyInterest`.

`SimulationContext` re-exports the types so consumers can import either from `@/types/simulation`
or `@/context/SimulationContext`.

### 3. Server vs. Client Components
Next.js App Router defaults to Server Components. Anything using state, context, hooks
(`useSimulation`, `usePathname`), MUI interactivity, or browser APIs **must** start with
`"use client";`. Pages that render the nav shell + interactive content are client components;
`layout.tsx` and the simple route `page.tsx` files stay server where possible, delegating
interactivity to `providers.tsx` and client components. Several historical bugs came from
missing `"use client"` — when in doubt, check whether a hook is used.

### 4. Global app wiring
`src/app/providers.tsx` (client) composes everything: MUI `ThemeProvider` + `CssBaseline`,
then `SimulationProvider` → `TutorialProvider`, and mounts the always-on overlays
(`WelcomeModal`, `TutorialOverlay`, `HelpFab`). Add new global providers/overlays here.

### 5. Page layout pattern
Every page renders the same shell: a flex column with `<TopNav />` on top and a flex row of
`<SideNav />` + page content. Follow this pattern for new pages and add the route to
`SideNav` navigation.

### 6. Tutorial system
- `TutorialContext` manages flow (status, current step/phase, completion %, pause/resume) and
  persists to `localStorage` under key `managing-partner-tutorial`.
- Tutorial content is data, not code: edit `src/data/tutorialSteps.ts`. Each step targets a
  page and a CSS `targetSelector` (or `center`), and may require a `navigate` /
  `advance_month` action. Steps reference `learningObjectiveIds` from
  `src/data/learningObjectives.ts`.
- The `TutorialOverlay` spotlights elements by selector — if you change DOM structure that a
  step targets, update the step's `targetSelector`.

### 7. Help & glossary
Searchable glossary lives in `src/data/glossaryTerms.ts`; per-metric help text in
`src/data/contextualHelp.ts`. Add new metrics' help text here and surface it via `HelpTooltip`.

## Domain Model (quick reference)

- **Time**: `month` (1–12) + `year`; quarter = `ceil(month/3)`. Game starts month 1, 2026.
- **Financials**: cash-flow driven — collections (not accrued revenue) move cash. AR aged in
  4 buckets (current/30/60/90+) with collection rates by client `paymentProfile`
  (`prompt`/`normal`/`slow`). Line of credit auto draws/repays at 8% annual interest.
- **Employees**: roles `Lobbyist | Attorney | Support`; metrics efficacy, burnout, salary,
  clientAffinity. Fully-loaded cost = salary × (1 + 0.25 benefits + 0.0765 FICA).
- **Clients**: types `Trade Association | Corporation | Non-Profit`; satisfaction, monthly
  fee, contract months remaining.
- **Reputation** (0–100): recomputed each month as 60% avg client satisfaction + 40% avg
  employee efficacy, with small random drift.
- **Inbox**: scenario events with `choices`; `handleInboxChoice` applies effects to state.
- `financialHistory` keeps the last 12 monthly snapshots (used for dashboard charts).

## Workflow for Changes

1. Make changes on the designated feature branch (see repo/task instructions).
2. Keep game logic in `SimulationContext`, pure math/types in `types/simulation.ts`, and
   static content in `data/`.
3. Run `bun run typecheck` and `bun run lint` — both must pass.
4. Commit with a clear, descriptive message and push.
5. Do **not** open a pull request unless explicitly asked.

## Related Documentation

- `README.md` — user-facing feature overview, structure, and game mechanics.
- `TODO.md` — phased implementation plan and progress.
- `AGENTS.md` + `.kilocode/` — Kilocode "memory bank" and recipes (e.g.
  `.kilocode/recipes/add-database.md` for adding persistence). `.kilocode/rules/development.md`
  contains the Bun/commit rules echoed above. Keep `.kilocode/rules/memory-bank/context.md`
  reasonably current when architecture, stack, or status changes meaningfully.
