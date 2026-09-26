# Managing Partner - Project Status

## Current State

Managing Partner is a playable single-browser prototype. The dashboard, five-tab finances view, HR, clients, inbox, 34-step tutorial, and help glossary are implemented. The first two passes are merged: they stabilized the simulation and save, improved desktop and mobile usability, attributed receivables to clients, and made inbox outcomes visible. The current pass records cash activity by category and reconciles the monthly cash view. There is no account, backend, or cross-device sync.

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

## Current Cash-Flow Pass

- [x] Record recurring cash paid and signed one-time, distribution, tax, and line-of-credit movements in monthly history.
- [x] Show a categorized cash waterfall with an honest January opening snapshot; mark unexplained movement from older saves as unclassified.
- [x] Put one-time operating decisions in their own P&L category, separate from collections and cash-only financing.
- [x] Migrate validated version 1 and 2 local saves to version 3 without assigning fictional causes to old cash movements.
- [x] Complete 33 tests, typecheck, lint, build, and responsive browser checks before commit and push.

## Next Work

- [ ] Define tax payable and penalty rules, if that level of accounting detail serves the game. The current tax scenario models a payment or deferral decision without a liability schedule.
- [ ] Expand scenario variety and balance outcomes after observing play sessions.
- [ ] Add a documented save export/import or account sync only if play across browsers or devices becomes a requirement.
- [ ] Run usability sessions with new players and refine tutorial length and labels.

## Quality Gate

Run `bun test`, `bun typecheck`, `bun lint`, and `bun run build` before committing. Walk through all five routes and the tutorial at 390, 768, 1280, and 1440px, including keyboard navigation.
