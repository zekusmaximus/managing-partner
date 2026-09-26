# Active Context: Managing Partner - Government Relations Simulator

## Current State

**Project Status**: Playable single-browser prototype. The first stabilization pass is merged. The current second pass tracks receivables by client, migrates version 1 saves to version 2 without inventing historical client balances, and shows actual inbox decision outcomes. Broader accounting and gameplay design remain future work.

This is a business simulation game where players manage a government relations firm. The application features:
- Dashboard with financial charts (Recharts)
- Financial management, HR, Clients, Inbox pages
- SessionContext for one versioned local save and SimulationContext for game actions
- MUI for UI components

## Recently Completed

- [x] Fixed react-router-dom import (changed to Next.js Link)
- [x] Fixed SimulationContext setState implementation
- [x] Created missing pages (finances, hr, clients, inbox)
- [x] Created comprehensive README.md
- [x] Implemented Advance Month functionality
- [x] Fixed TypeScript errors: MUI v6 ListItem button prop (converted to ListItemButton), Recharts tooltip formatter types
- [x] Fixed Next.js client/server boundary error in SideNav by adding `"use client"` for `usePathname` usage
- [x] Fixed Next.js build failures by moving Dashboard out of `src/pages`, adding client providers, and resolving server/client boundary issues
- [x] Fixed tutorial welcome modal hydration warning by replacing nested heading tags inside `DialogTitle` with a valid `div > h2 + p` structure
- [x] Removed accidentally staged Claude worktree repository from Git tracking and ignored `.claude/worktrees/`

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home/Dashboard | ✅ Ready |
| `src/app/finances/page.tsx` | Finances page | ✅ Ready |
| `src/app/hr/page.tsx` | HR page | ✅ Ready |
| `src/app/clients/page.tsx` | Clients page | ✅ Ready |
| `src/app/inbox/page.tsx` | Inbox page | ✅ Ready |
| `src/components/layout/TopNav.tsx` | Top navigation | ✅ Ready |
| `src/components/layout/SideNav.tsx` | Side navigation | ✅ Ready |
| `src/app/providers.tsx` | Client providers and theme | ✅ Ready |
| `src/components/layout/AppShell.tsx` | Shared desktop/mobile shell | ✅ Ready |
| `src/context/SessionContext.tsx` | Versioned local save and New Game | ✅ Ready |
| `src/context/SimulationContext.tsx` | Component-facing simulation actions | ✅ Ready |
| `src/lib/simulation/` | Testable transitions and financial metrics | ✅ Ready |
| `src/lib/session/` | Save validation and tutorial defaults | ✅ Ready |
| `src/components/dashboard/Dashboard.tsx` | Main dashboard component | ✅ Ready |
| `README.md` | Project documentation | ✅ Ready |

## Current Focus

Keep the simplified game model internally consistent and make decision consequences clear. Next accounting decisions concern tax liabilities and penalties, one-time expenses, partner distributions, and cash-flow categories including credit-line transactions. Scenario balance and tutorial usability need observation with new players.

## Stabilization Snapshot (2026-09-25)

- Dashboard, finances (five tabs), HR, clients, inbox, tutorial, and help/glossary are implemented. `TODO.md` now describes the actual prototype and future work instead of a stale completion percentage.
- Month transitions, inbox outcomes, and shared P&L calculations live in `src/lib/simulation/`. Inbox scenarios identify their subjects; financial amounts are guarded; January and quarter rollovers, write-offs, reallocations, margin, and historical category totals were corrected.
- One versioned `localStorage` save holds simulation and tutorial together. It loads after hydration, validates data, restores message/alert dates, discards the legacy tutorial key, and provides a confirmed New Game reset. Corrupt or unavailable storage starts a fresh session with a nonblocking notice.
- A shared app shell puts the header above the desktop sidebar and uses a mobile drawer. The date and single Advance Month control stay reachable. Alerts, help labels, keyboard inbox actions, chart legends, and tutorial targets were repaired.
- Focused `bun test` cases cover simulation and save behavior. `bun typecheck`, `bun lint`, and `bun run build` pass. Browser checks cover all routes at 390, 768, 1280, and 1440px.

## Second Pass Snapshot (2026-09-26)

- The first stabilization pass was squash-merged into `main` as `7f508de` (PR #3). The second pass builds from that merged state.
- Receivables now retain client IDs, names, payment profiles, and four aging buckets. Aggregate AR derives from those accounts. Former-client balances remain visible and collectible; opening and migrated pooled balances are labeled unassigned.
- The browser save uses version 2. Valid version 1 saves migrate their pooled AR to an unassigned account and keep simulation and tutorial progress together.
- Inbox choices record a resolution with the selected choice and actual result. The inbox detail view shows this feedback, and choice copy is aligned with effects the simplified model actually applies.
- The AR chart keeps all four age labels visible on mobile; the partner view no longer presents all-time distributions as YTD compensation. Tutorial examples now avoid promising unmodeled scenario effects or a fixed staffing ratio.
- Final verification: 26 Bun tests, typecheck, lint, and production build pass. The five routes were checked at 390, 768, 1280, and 1440px; the 34-step tutorial completed across those widths with keyboard navigation checks and no browser errors.
- Remaining accounting boundaries include tax liabilities and penalties, one-time expenses, partner distributions, and explicit cash-flow categories. This pass does not establish a full ledger.

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-11 | Bug fixes: react-router-dom to Next.js Link, SimulationContext setState, created missing pages, created README, implemented Advance Month |
| 2026-03-11 | Fixed TypeScript errors: MUI v6 ListItem button prop, Recharts tooltip formatter types in inbox, clients, finances, Dashboard pages |
| 2026-03-11 | Fixed `usePathname` client hook error by marking `src/components/layout/SideNav.tsx` as a Client Component |
| 2026-03-11 | Fixed full build: moved Dashboard from `src/pages` to `src/components/dashboard`, added `src/app/providers.tsx` for MUI/Simulation providers, marked TopNav as Client Component |
| 2026-03-15 | Fixed invalid heading nesting in `src/components/tutorial/WelcomeModal.tsx` that caused a React hydration warning in the tutorial welcome dialog |
| 2026-03-15 | Removed accidental nested Git worktree at `.claude/worktrees/elated-neumann` from the repo index and ignored `.claude/worktrees/` to prevent re-staging |
| 2026-09-25 | Reviewed implementation, build/lint status, simulation correctness, and desktop/mobile UI; recorded findings above |
| 2026-09-25 | Implemented first stabilization pass: pure simulation functions, local save, responsive shell, tutorial and UI fixes, tests, and documentation updates |
| 2026-09-26 | Merged first stabilization pass; began client-attributed AR, version 1 to 2 save migration, and inbox outcome feedback |
