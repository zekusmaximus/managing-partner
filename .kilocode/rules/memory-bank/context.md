# Active Context: Managing Partner - Government Relations Simulator

## Current State

**Project Status**: Playable single-browser prototype on `main` after merged PR #8, with an interim playtest feedback pass in progress. Staffing influences service, satisfaction, and renewals; repeatable free client controls are removed and manual collections are limited to once per game month. Early notes identified warnings without clear responses and unclear action tradeoffs. The follow-up adds a paid client meeting, warning links, and explicit finance consequences. Valid version 1–3 saves migrate to version 4, and older version 4 saves remain valid. Further new-player observations remain pending.

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

Keep the simplified game model internally consistent and make decision consequences clear. The next product priority is to validate the core staffing, client, and cash tradeoffs with human play sessions; scripted balance policies alone do not establish player behavior. The tax balance remains deliberately simple.

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
- Tax liabilities and penalties were left for a later design decision; the second pass did not establish a full ledger.

## Cash-Flow Pass Snapshot (2026-09-26)

- The second pass was squash-merged into `main` as `0257f02` (PR #4). The cash-flow branch starts from that merged state.
- Monthly history now records opening cash, recurring cash paid, and signed cash movements for credit-line draws/repayments, partner distributions, estimated tax payments, equipment purchases, hiring, severance, and repairs. Hiring, severance, and repairs also enter a separate P&L operating-cost category; bad debt remains noncash.
- The initial January entry is an opening cash snapshot: its P&L run rate is displayed but recurring costs have not been paid in cash. The cash waterfall shows categorized activity and reconciles to ending cash. The projection uses observed recurring cash months and excludes one-time decisions.
- The version 3 local save migrates version 1 and 2 records. The oldest retained legacy month has unknown opening cash; later unexplained changes are preserved as unclassified movements rather than assigned invented causes. Older save keys are retired after a successful version 3 write.
- Verification: 33 Bun tests, typecheck, lint, and production build pass. All five routes were checked at 390, 768, 1280, and 1440px without horizontal overflow; the month control stayed visible. Keyboard LOC actions, same-month draw/repayment reconciliation, reload persistence, and browser error logs were checked.
- This remains a simplified educational model; the later phase below adds a fictional tax balance and late charge.

## Tax, Scenario, and Tutorial Pass Snapshot (2026-09-26)

- A fictional 25% estimate on positive pretax profit is booked when a month opens, including the initial January snapshot. Unpaid principal receives a fictional 2% late charge at quarter opening. Tax expense and penalties reduce P&L profit but not cash; quarter-end payment decisions clear penalties first and move cash once. Later one-time actions can alter final profit without revising the month-opening estimate.
- The Finance P&L shows tax expense and late charges; Cash Flow shows the payable components. Repay LOC defaults to an amount covered by current cash and disables when repayment is unavailable.
- Version 4 saves migrate valid version 1–3 records with zero opening tax debt rather than inventing old liabilities. Legacy unresolved tax prompts expire; pending non-tax decisions remain available. Scenario generation is deterministic in tests, deduplicates pending subjects, includes more prospect names, and offers an outstanding-balance tax prompt at quarter end.
- Tutorial month checkpoints remember the starting year and avoid a second advance if the game has moved past a checkpoint. Spotlight keyboard focus is confined to the tutorial controls and highlighted target, including mobile navigation. The finance copy and runway example now match the displayed model.
- Verification: 51 Bun tests, typecheck, lint, and production build pass. All five routes have no horizontal overflow at 390, 768, 1280, and 1440px. The 34-step tutorial completed across those widths; mobile menu navigation and Tab focus, AR tab targeting, stale month checkpoints, the quarter-end tax prompt, and the quarter-opening penalty were checked in the browser with no console errors.

## Gameplay Balance Pass Snapshot (2026-09-27)

- The tax, scenario, and tutorial work was merged into `main` as `0e4914f` (PR #5). This balance pass starts on a fresh `codex/gameplay-balance-pass` branch from that commit.
- A seeded harness advances 24 months from the January 2026 opening snapshot across seeds 7, 23, 41, 89, and 127 under stewardship and cash-guard scripted policies. The checked-in `docs/balance-simulation.md` records the policies, baseline and final means, credit/cash/profit, churn/renewals, staff, reputation, and inbox measurements. These are model results, not human playtest findings.
- In the stewardship simulations, mean ending cash changes from -$112,612 to $640,629; cumulative profit from -$384,129 to $568,186; churn from 9.6 to 3.2; ending burnout from 99.4 to 13.4; and discretionary prompts from 42.0 to 35.4 per run. Contract expiry correction drives much of the financial difference, so the before/after change is not attributable to one feature.
- The staff recovery action funds up to 12 employees with burnout of at least 20 for $1,500 each, once per month if cash covers it. It reduces each participant's burnout by up to 25, restores up to 5 efficacy, and books a current-month cash movement, P&L one-time cost, and Payroll budget actual. The existing version 4 save format accepts the additive movement and preserves the cooldown through reload; version 1–3 migrations remain valid.
- Expiring contracts now resolve into a new 12-month term or churn, with named outcome alerts. Churn ends new billing, while former-client receivables continue aging and collecting. Discretionary inbox probabilities were reduced while unresolved decisions remain available and quarter-end tax prompts still appear whenever tax is due.
- Scripted cash-guard behavior still allows severe burnout and can exhaust the credit line; one final seed ended with negative cash. Human playtesting and any deeper tax model remain later decisions.
- Verification: 65 Bun tests, typecheck, lint, and production build pass. Browser checks cover all five routes without horizontal overflow at 390, 768, 1280, and 1440px. Keyboard activation and reload were checked for staff recovery and finance tabs, renewal/churn and former-client AR, and quarter-end tax and retained inbox decisions at all four widths; there were no browser console errors.

## Cash-Constrained Play Pass Snapshot (2026-09-27)

- PR #6 merged the balance pass into `main` as `fa3b6a1`. The current branch starts at that commit with a clean working tree.
- Seed 23 under cash guard retains the early staff burnout burden while client revenue drops below recurring costs in 2027. The $100,000 credit line fills in December 2027 and the run ends with negative cash in January 2028. This is a deterministic simulation outcome, not a human playtest observation.
- Targeted staff recovery covers up to two highest-burnout eligible employees at $500 each, reduces burnout by up to 15 and raises efficacy by up to 3 per person. With $500–$999 available, the quote covers one person. It shares the full program's monthly cooldown and current-month cash, P&L, and Payroll budget entries without changing the version 4 save shape.
- The dashboard exposes remaining credit at or below 20% of the limit and links to the existing Cash Flow borrowing/repayment controls.
- Across five seeds, cash guard versus cash pressure ends with mean cash $168,809 versus $153,647; credit drawn $20,000 versus $27,389; cumulative profit -$29,022 versus -$51,572; churn 3.6 in both; burnout 99.7 versus 42.0; efficacy 6.4 versus 76.1; reputation 44.8 versus 72.4; and ending pending inbox 2.6 in both. Recovery improves staff measures at a cash cost. Seed 23 still fills the credit line after client revenue drops below recurring costs. These are simulation results, not human playtest findings.
- Focused save/recovery/harness tests and the full Bun gate pass: 71 tests, typecheck, lint, and production build. At 390, 768, 1280, and 1440px, browser checks confirmed the low-credit warning and keyboard deep link to Cash Flow controls, an unaffordable full recovery quote beside the $500 targeted quote, keyboard funding, and reload persistence of the credit link and shared monthly cooldown. There was no horizontal overflow or browser console error in these changed flows.

## Review Snapshot (2026-09-27)

- Reviewed clean `main` after PR #7. The documented Bun gate passes: 71 tests, typecheck, lint, and production build. No code changes were made in this review.
- The simulation currently bills and renews clients even with zero employees; employee affinity is displayed but has no modeled effect on service or renewals. Direct client addition at arbitrary fees and repeatable free satisfaction increases bypass the intended management tradeoffs.
- The AR "Run Collections" action can be repeated in a month to accelerate nearly all overdue balances. The Clients contract timeline double-counts terms longer than 12 months in its 7–12 and >12 buckets.
- Live UI checks found a usable desktop shell and mobile navigation, but six full-width KPI cards push the dashboard's chart, alerts, and roster far below the first phone screen. The five finance tabs and P&L table require horizontal scrolling on a 390px viewport without a clear scroll cue. This review sampled the welcome, dashboard, navigation, Clients desktop, and mobile P&L screens; it did not rerun the full tutorial.
- The remaining product work is human playtesting of game balance and tutorial usability. Save portability, deeper tax accounting, and explicit win/loss conditions remain product decisions. `TODO.md` still describes the now-merged recovery branch as current, and the page metadata overstates model accuracy.

## Client Service and Mobile Usability Pass (2026-09-27)

- Billable staff supply effective client slots from efficacy, client affinity, and burnout. Effective support staff multiply the billable team's capacity. Monthly coverage changes satisfaction and renewal probability, with shortfall alerts and a dashboard service indicator. With no billable staff, expiring contracts cannot renew.
- The Clients page no longer offers direct Add/Remove Client or free satisfaction adjustment. New business and client responses go through inbox decisions. Manual collections now use a saved month/year marker, allow one attempt per game month, and restore older version 4 saves without the field.
- The phone dashboard begins with a compact cash/alerts/next-action/service brief, then alerts and a two-column KPI grid. Finance reports use a phone/tablet selector, and the phone P&L offers month or YTD in a three-column table. The contract timeline no longer counts long terms twice.
- `docs/service-balance-simulation.md` records five seeded 24-month policy runs under the revised rule. The no-recovery policy still ends at mean -$117,238 cash with 0.4 clients. These results show scripted model behavior, not new-player outcomes. `docs/new-player-playtest.md` gives the user a 3–5 participant session plan; notes are pending before any deeper tax or persistence work.
- Verification: 78 Bun tests, typecheck, lint, and production build pass. Read-only browser checks at 390px and 1280px found no dashboard/finance page overflow or console errors; the phone report selector and YTD toggle worked. A live employee dismissal check was rejected by automatic approval review as an unauthorized destructive test mutation, so the staffing transition was verified by pure tests instead.

## Interim Playtest Feedback Pass (2026-09-28)

- The user shared early notes without a participant count: warnings for overdue collections and approaching renewals did not lead clearly to an action, and decision upsides and downsides were unclear, especially bad-debt write-offs. Treat these as qualitative findings rather than a completed playtest.
- A client meeting is available when an active client has a contract within three months of expiry, satisfaction below 70%, firm coverage below 90%, or 31+ day receivables. The firm can hold one meeting per game month for $1,000 cash and current-month expense. It raises that client’s satisfaction by up to 6 and collects 15% of that client’s overdue AR, capped at $3,000. The quote and outcome show the exact effects; meeting cash/AR/P&L/budget entries reconcile, and an additive marker survives version 4 save reloads.
- Dashboard warnings describe the consequence and link to the relevant client, AR, HR, cash, or budget view. Current client/AR/service warnings carry optional structured targets; old saves remain valid. AR write-offs and other finance actions now preview modeled gains, losses, and unchanged measures. Inbox choice copy was aligned with modeled effects.
- Verification: 85 Bun tests, typecheck, lint, and production build pass. The seeded 24-month policies do not use meetings and their results remain unchanged. Read-only browser checks confirmed the targeted client link and AR report hash, the meeting and AR copy, no page overflow at 390px, and no console errors. Further player sessions are needed to test comprehension of the revised loop.

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
| 2026-09-26 | Merged first stabilization pass; implemented client-attributed AR, version 1 to 2 save migration, and inbox outcome feedback |
| 2026-09-26 | Merged client-receivables pass as PR #4; implemented categorized cash movements, P&L one-time costs, version 3 save migration, and reconciled cash view on a new branch |
| 2026-09-26 | Added estimated tax payable and late charges, version 4 save migration, deterministic scenario generation, pending-decision retention, and tutorial accessibility fixes on the cash-flow branch; PR deferred pending this phase |
| 2026-09-27 | Merged the tax, scenario, and tutorial pass as PR #5 (`0e4914f`); completed a seeded gameplay balance pass with staff recovery, contract expiry resolution, and inbox pacing on a new `codex/` branch |
| 2026-09-27 | Merged the gameplay balance pass as PR #6 (`fa3b6a1`); started the cash-constrained recovery and credit-visibility pass on `codex/cash-pressure-recovery` |
| 2026-09-27 | Reviewed merged PR #7 on `main`, verified 71 Bun tests and production quality gates, and recorded gameplay and status findings |
| 2026-09-27 | Implemented service/retention and collections constraints, mobile dashboard/finance improvements, a seeded balance report, and a new-player session plan; human notes pending |
| 2026-09-27 | Opened PR #8 for the client-service and mobile usability pass; user will run new-player sessions after merging and share notes |
| 2026-09-28 | Recorded early playtest feedback; implemented client meetings, warning actions, and finance consequence previews; full quality gate passes and further sessions remain pending |
