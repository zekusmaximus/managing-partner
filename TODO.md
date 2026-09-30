# Managing Partner - Project Status

## Current State

Managing Partner is a playable single-browser prototype with a dashboard, five-tab finances view, HR, clients, inbox, and help glossary. Stage 1 corrected workload and shared-attention rules; Phase 2 added the authored three-round case; Phase 3 replaces new-player orientation with short guided predictions, actual-result recaps, and an April teaching review. The former 34-step tutorial remains only as legacy save history. There is no account, backend, or cross-device sync. One playtester’s learning uncertainty remains a preliminary observation; the guided case has no new human learning evidence.

The earlier 15–20% completion estimate and checklist described work that has since been built. Progress toward a finished game cannot be stated as a precise percentage without defining the intended feature set.

## Completed in the Stabilization Pass

- [x] Extract testable simulation transitions, inbox decisions, and P&L metrics.
- [x] Target inbox decisions to named subjects and prevent repeat actions.
- [x] Validate finite monetary inputs; correct quarter opening actuals, reallocations, margin, write-offs, and historic category totals.
- [x] Save simulation and tutorial together after hydration; restore dates; validate corrupt saves; provide confirmed New Game.
- [x] Use one responsive app shell, reachable mobile month controls, alert navigation, accessible help and inbox buttons, and a chart legend.
- [x] Align tutorial examples and spotlight actions with the displayed model and navigation.
- [x] Add focused simulation and save tests.

## Completed Second Pass

- [x] Track AR aging by client while retaining firm-wide bucket totals; keep former-client balances visible and opening/migrated balances explicitly unassigned.
- [x] Migrate validated version 1 local saves to version 2 without inventing a client for pooled historical AR.
- [x] Show the selected inbox action and its actual result in resolved messages; align choice descriptions with modeled effects.
- [x] Remove the partner view's mixed-period YTD compensation total and keep all-time distributions labeled accurately.

## Completed Cash-Flow Pass

- [x] Record recurring cash paid and signed one-time, distribution, tax, and line-of-credit movements in monthly history.
- [x] Show a categorized cash waterfall with an honest January opening snapshot; mark unexplained movement from older saves as unclassified.
- [x] Put one-time operating decisions in their own P&L category, separate from collections and cash-only financing.
- [x] Migrate validated version 1 and 2 local saves to version 3 without assigning fictional causes to old cash movements.
- [x] Complete 33 tests, typecheck, lint, build, and responsive browser checks for the cash-flow work.

## Completed Tax, Scenario, and Tutorial Pass

- [x] Add a fictional estimated tax provision, payable balance, quarter-opening late charge, and cash payments that clear penalties first.
- [x] Show the tax expense, late charge, and unpaid balance in Finances; explain that the provision is a month-opening estimate.
- [x] Migrate validated version 1–3 saves to version 4 without inventing past tax debt; expire older tax prompts that have no recorded balance.
- [x] Generate inbox scenarios with testable randomness, avoid duplicate pending decisions, preserve unresolved decisions, and broaden the new-client name pool.
- [x] Keep overdue tutorial month checkpoints from advancing the game twice, confine keyboard focus to tutorial controls and the highlighted action, and correct finance copy and repayment affordances.
- [x] Pass 51 Bun tests, typecheck, lint, and production build; check all five routes at 390, 768, 1280, and 1440px, then complete the tutorial across those widths with keyboard navigation.

## Completed Gameplay Balance Pass

- [x] Run a reproducible 24-month, five-seed simulation under stewardship and cash-guard policies; record before/after cash, credit, profit, churn, staff, reputation, and inbox metrics as model results.
- [x] Add a priced, once-per-month staff recovery program with bounded burnout and efficacy effects, explicit HR quote, P&L and cash entries, and Payroll budget actuals.
- [x] Resolve expiring client contracts into a new 12-month term or churn; show outcome alerts and keep former-client receivables collectible.
- [x] Reduce discretionary inbox prompts while preserving unresolved decisions and quarter-end tax decisions.
- [x] Keep the version 4 save format and version 1–4 compatibility; accept the additive staff-recovery cash movement and verify reload cooldown.
- [x] Pass 65 Bun tests, typecheck, lint, and production build; check all five routes at 390, 768, 1280, and 1440px, including keyboard recovery, finance tabs, renewal/churn, pending inbox and tax prompts, and reload persistence.

## Completed Cash-Constrained Play Pass

- [x] Investigate the seeded cash-guard run that exhausts its credit line and ends with severe burnout.
- [x] Add a smaller, cash-funded targeted recovery choice with an explicit per-person price, bounded effects, and the existing monthly cooldown and accounting.
- [x] Show low remaining credit on the dashboard with a direct link to the existing Cash Flow controls.
- [x] Compare seeded cash-guard and recovery-under-pressure policies across cash, credit, profit, churn, burnout, efficacy, reputation, and pending inbox volume; label these as simulation results.
- [x] Verify version 1–4 save compatibility, focused tests, Bun quality gates, and changed keyboard/reload flows at 390, 768, 1280, and 1440px.

## Client Service and Mobile Usability Pass

- [x] Link billable staffing, efficacy, affinity, and burnout to client service coverage, monthly satisfaction, and renewal odds; surface shortfalls in the dashboard and alerts.
- [x] Route client acquisition and feedback through inbox decisions instead of repeatable free client controls.
- [x] Limit manual collections to one attempt per game month, preserve the limit in existing version 4 saves, and explain it beside the action.
- [x] Put a compact decision brief and alerts above dashboard detail on phones; make finance reports selectable and year-to-date P&L readable without sideways scrolling.
- [x] Re-run the seeded balance check under the revised service rule and prepare a new-player session script.

## Interim Playtest Feedback Pass

- [x] Record the first qualitative notes: overdue and approaching-renewal warnings lacked an obvious response, and action costs and benefits were unclear, especially bad-debt write-offs.
- [x] Add a paid, once-per-month client meeting for renewal, satisfaction, service, or payment risk; show a client-specific estimate and record its cash, AR, profit, and budget effects.
- [x] Link dashboard warnings and overdue AR rows to relevant actions, and explain that warning snapshots may remain after a player responds.
- [x] Preview modeled AR write-off, collection, credit, budget, and distribution effects; clarify uncertain inbox outcomes.
- [x] Verify the new meeting and save behavior with focused tests and run the full Bun quality gate. The existing scripted balance policies do not exercise meetings and their results are unchanged.

## Focused Decision Loop Pass

- [x] Show the expiring client's monthly fee and share of current contracted monthly fees at the warning, and link to the relevant client meeting.
- [x] Separate current warning conditions from dated outcomes. Recheck saved warning snapshots against current client, AR, cash, credit, budget, and staff state so resolved conditions do not inflate the active alert count; explain how to dismiss prior outcomes.
- [x] Frame 90+ day debt as a choice between collection and giving up a balance. Keep the once-per-month meeting and collections limits and the cash, AR, and profit previews visible at the action.
- [x] Charge $3,000 cash and current-month profit for aggressive new-client pursuit whether or not the prospect signs. Show the tradeoff in new and older pending offers and record the expense in the cash waterfall and budget.
- [x] Keep phone finance reports selectable and year-to-date P&L readable; add focused playtest checks for finding AR and profit without guidance.
- [x] Pass 93 Bun tests, typecheck, lint, and production build. Check all five routes at 390, 768, 1280, and 1440px without document overflow; exercise phone keyboard navigation to finance reports, YTD P&L, renewal warnings, and client meetings, plus collections and pursuit outcomes at 390px. No browser console errors or warnings appeared.

## Completed Authored Three-Round Case (Phase 2)

- [x] Add a separate, reconciled January opening firm with positive profit, constrained cash, TechTrade Association's named overdue receivable, near-limit service coverage, and three months until its renewal. Preserve the free-play opening.
- [x] Schedule January collection; February conflict review with decline, hold, or reviewed narrower-scope pursuit; and March's external policy delay with a second client's complaint. Resolve the anchor renewal on the April advance under the existing service and satisfaction rules.
- [x] Require explicit case choices before each advance, allow valid hold/defer paths, and preserve one case schedule through reloads and rapid actions. Use the confirmed New Game/reset flow to start the case.
- [x] Keep the original conflicting scope unsignable, ordinary intake review free of partner-attention cost, and pursuit expense and possible service demand visible even if signing fails.

## Completed Guided Decisions and Review (Phase 3)

- [x] Replace the 34-step new-player tour with brief case orientation and one prediction and reflection per January–March round. Accept wrong answers and “I’m not sure” without grading or blocking later choices.
- [x] Require a recorded prediction, the round's case decisions, and a reflection before the shared Advance Month transition proceeds; keep pending-decision guidance visible, reloadable, and resistant to repeated clicks.
- [x] Show immediate and monthly actual-result feedback that separates player actions, service effects, collections and recurring costs, credit movement, external policy timing, and uncertain signing or renewal.
- [x] Add an April **Case completed** review with the three actual decision summaries, TechTrade Association's outcome, and a fresh application question. Allow the same firm to continue afterward.
- [x] Make pause and explicit leave-case handoffs distinct, preserve the firm, and stop future case events on leave. Keep valid version 1–4 firm saves and retired tutorial history without assigning old steps to new lessons.

## Next Work

- [x] Complete Stage 1, slice A in `docs/learning-improvement-plan.md`: workload and fatigue rules, shared partner attention, complaint alternatives, salary commitments, truthful copy, save compatibility, focused tests, seeded balance report, and browser checks. Numerical workload bands remain fictional game assumptions; no tuning adjustment was needed.
- [x] Build the authored three-round GR case and its intake/policy scenarios (delivery slice B).
- [x] Replace the existing orientation with prediction prompts, causal recaps, and a final teaching review (delivery slice C), preserving valid version 1–4 firm saves.
- [ ] Freeze the learning-focused playtest kit, then observe first-time players with distinct pre/post transfer questions (delivery slice D). The updated `docs/new-player-playtest.md` supports Phase 2 case rehearsal, not a new learning claim.
- [ ] Revisit the $3,000 pursuit price and service balance after player observations; the initial price is a game design choice, not a measured real-world cost.
- [ ] Deferred beyond this playtest package: decide whether the simplified month-opening tax estimate needs a deeper accounting model.
- [ ] Deferred beyond this playtest package: add a documented save export/import or account sync only if play across browsers or devices becomes a requirement.

## Quality Gate

Run `bun test`, `bun typecheck`, `bun lint`, and `bun run build` before committing. Walk through all five routes and the guided case at 390, 768, 1280, and 1440px, including keyboard navigation, reloads, overflow, and console checks. These technical gates do not replace the Phase 4 learning study.
