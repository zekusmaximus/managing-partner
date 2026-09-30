# Managing Partner - Government Relations Simulator

> An educational business simulation about managing a government relations firm.

## Overview

**Managing Partner** is a business simulation game where players take on the role of a managing partner at a mid-size government relations firm in Washington, D.C. Make strategic decisions about finances, human resources, and client relationships. New players can start a short guided January–March case or explore the original free-play firm. Each case round asks for a prediction, a management decision, and a reflection on the actual result; April closes with a teaching review.

This is a playable prototype with a simplified financial model. Progress is saved in the current browser; a confirmed **New Game** action resets the simulation and guidance together. Valid version 1–4 saves migrate to the current version 5 format on load.

## Features

- **Dashboard Overview**: Real-time KPIs including cash position, collections, operating margin, DSO, and reputation, plus current warnings, dated outcomes, and links to relevant actions
- **Financial Management**: 5-tab interface with P&L statements, budget tracking, client-attributed AR aging, a reconciled cash waterfall, tax balance, and partner economics; a report selector and month/YTD P&L switch keep key reports reachable on phones
- **HR Management**: Manage pooled billable and support capacity, see how current coverage affects next-month burnout, increase committed salaries, and fund recovery that reduces fatigue without adding permanent skill
- **Client Relations**: Monitor satisfaction, service coverage, contract timelines, renewals, churn, and revenue; allocate one shared monthly partner intervention to a paid recovery meeting or a personal collection call
- **Inbox System**: Handle scenario-based decisions including compensation requests, vendor contracts, budget overruns, tax payments, and new business opportunities; pending decisions remain available and completed messages show the actual outcome
- **Guided Case**: Follow a brief orientation, make and review one prediction in each January–March round, then see TechTrade Association's April renewal or departure and a final application question. Predictions can be uncertain or wrong; required predictions and case choices gate advancement, and progress survives reloads.
- **Free Play and Handoff**: Pause case guidance without losing case decisions, or explicitly leave the case and keep managing the same firm. Existing firms continue in free play; starting a fresh case uses confirmed New Game.
- **Help System**: Searchable glossary with 55+ industry terms, contextual help tooltips on every metric, and a floating help button
- **Local Save**: Simulation decisions, receivables, cash activity, inbox outcomes, and case progress resume together after a reload; valid version 1–4 firm saves remain loadable

## Tech Stack

| Technology | Version |
|------------|---------|
| Next.js | 16.x |
| React | 19.x |
| TypeScript | 5.x |
| MUI (Material UI) | 7.x |
| Recharts | 3.x |
| Tailwind CSS | 4.x |

## Getting Started

### Prerequisites

- Bun for the commands below. Next.js 16 also requires Node.js 20.9+ if run with Node directly.

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Open http://localhost:3000 in your browser.

### Building for Production

```bash
bun run build
bun run start
```

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home/Dashboard
│   ├── layout.tsx                # Root layout with providers
│   ├── providers.tsx             # Context providers & theme
│   ├── finances/page.tsx         # Financial management (5-tab view)
│   ├── hr/page.tsx               # HR/employee roster
│   ├── clients/page.tsx          # Client relations
│   └── inbox/page.tsx            # Decision inbox
├── components/
│   ├── dashboard/
│   │   └── Dashboard.tsx         # Main dashboard with KPIs & charts
│   ├── layout/
│   │   ├── AppShell.tsx          # Shared header, sidebar, and mobile drawer
│   │   ├── TopNav.tsx            # Top navigation with alerts & inbox count
│   │   └── SideNav.tsx           # Navigation, case entry, and New Game
│   ├── finances/
│   │   ├── PLStatement.tsx       # Income statement
│   │   ├── BudgetTracker.tsx     # Quarterly budget tracking
│   │   ├── ARManager.tsx         # Accounts receivable aging
│   │   ├── CashFlowView.tsx      # Cash flow statement
│   │   └── PartnerEconomicsView.tsx  # Partner draws & distributions
│   ├── hr/
│   │   └── StaffingEconomics.tsx # Total cost of workforce analysis
│   ├── tutorial/                 # WelcomeModal for guided-case or free-play entry
│   ├── case/                     # In-page guided progress, recaps, and April review
│   └── help/
│       ├── HelpFab.tsx           # Floating help button
│       ├── GlossaryDrawer.tsx    # Searchable glossary drawer
│       └── HelpTooltip.tsx       # Contextual help on metrics
├── context/
│   ├── SessionContext.tsx         # One versioned browser-local save
│   ├── SimulationContext.tsx      # Simulation actions
│   └── TutorialContext.tsx        # Tutorial actions
├── lib/
│   ├── simulation/               # Pure transitions, authored case, and shared financial metrics
│   └── session/                  # Save loading, validation, and defaults
├── data/
│   ├── tutorialSteps.ts          # Retired tour reference content, not mounted
│   ├── learningObjectives.ts     # Legacy topic descriptions, not an assessment
│   ├── glossaryTerms.ts          # 55+ industry glossary terms
│   └── contextualHelp.ts         # Help text for each metric
└── types/
    └── simulation.ts             # Core TypeScript interfaces
```

## Game Mechanics

### Simulation State

The game tracks the following:

- **Month/Year**: Current simulation date
- **Financials**: Cash on hand, revenue, expenses, collections, profit, client-attributed accounts receivable (4-bucket aging), line of credit, and estimated tax balance
- **Employees**: Lobbyists, attorneys, and support staff with efficacy, burnout, salary, and client affinity metrics
- **Clients**: Corporations, trade associations, and non-profits with satisfaction, contract terms, and payment profiles (prompt/normal/slow)
- **Reputation**: Overall firm reputation (0-100)
- **Operating Costs**: Rent, insurance, technology, compliance, miscellaneous
- **Vendors**: Third-party service providers with contract tracking
- **Partner Economics**: Monthly draws and distribution pools

### Authored Three-Round Case

Use the confirmed **New Game** flow to start the authored case. Starting it replaces the current browser-local firm only after that explicit reset; loading an existing save resumes the firm instead. Free play retains its original opening conditions.

The case begins in January 2026 with $45,000 cash, an undrawn $100,000 credit line, $33,000 in receivables including $18,000 overdue from TechTrade Association, and positive reported profit of $16,589. Service coverage starts near its limit, and TechTrade's contract has three months remaining. Opening cash, receivables, tax, budget, and financial history use the normal model rather than a separate case ledger.

- **January:** Choose how to address TechTrade's overdue balance. Collection choices can change cash and AR without creating new billed revenue; personal contact uses the shared partner intervention.
- **February:** Review Community Energy Council's proposed $18,000/month opposing advocacy mandate. That original scope cannot be signed. After ordinary intake review, decline, hold for clarification, or seek a separately approved $12,000/month public-monitoring assignment through initial contact or paid aggressive pursuit. The choices show signing odds, up-front cost, and possible effect on service coverage. Paid pursuit costs $3,000 even when signing fails.
- **March:** A committee delays TechTrade's policy issue independently of the firm's earlier choices. Decide how to respond while a different existing client also raises a complaint; personal responses compete for the monthly partner intervention, while delegation and deferral remain explicit paths.
- **April:** The existing service and satisfaction rules resolve TechTrade's renewal. The case reaches a terminal state whether the prospect signed, the client renewed, or the firm was managed poorly; the current firm can continue afterward.

Each round requires a recorded prediction, explicit case choices, and a reflection before advancing, including hold or defer when appropriate. A wrong prediction or “I’m not sure” remains a valid answer. Guidance shows actual cash, receivable, profit, service, credit, and attention effects separately from external events and uncertain signing or renewal. Case events have stable identifiers and resume from the local save without being regenerated as duplicate prompts. This is a fixed authored situation using the ordinary simulation transitions, not a general story engine.

Pausing guidance hides teaching prompts while the case schedule and firm remain intact. **Leave case and continue freely** ends the case schedule and keeps the current firm; unfinished case-only decisions are recorded as held without invented financial effects. April's **Case completed** review summarizes the three decisions, TechTrade's outcome, and one new application question. Completing or leaving the case does not reset the firm. Continuing play and starting a fresh New Game remain separate actions.

### Financial Model

- Simplified accrual P&L and cash tracking — client fees are billed as revenue; collections drive cash
- AR aging in 4 buckets (0-30, 31-60, 61-90, 90+ days), tracked by client and collected using each client's payment profile
- Receivables from former clients remain visible and collectible. Opening balances and migrated version 1 balances with no known client stay explicitly labeled as unassigned rather than being attributed to a current client.
- Contracts resolve when their remaining term reaches zero. Retained clients start a new 12-month term; clients who leave stop generating invoices, while their existing receivables continue to age and be collected. An expiry warning shows the monthly fee at risk and its share of current contracted monthly fees, with a link to the client's meeting option. Dated outcome alerts name renewals and departures separately from current warnings.
- Lobbyists and attorneys provide client service capacity based on efficacy, client affinity, and high burnout. Effective support staff improve how much of that capacity reaches clients. The initial four billable staff and one support employee cover roughly eight clients. A shortfall lowers monthly satisfaction and renewal odds; with no billable staff, contracts cannot renew. A dashboard service indicator and month-end alerts explain shortfalls.
- The manual **Run Collections** action can be attempted once per simulation month when receivables are overdue. It moves collected amounts from AR to cash, is recorded in the local save, and becomes available again next month.
- One **major partner intervention** per simulation month is shared across Clients recovery meetings, personally led complaint recovery in Inbox, and personal collection calls. This models major escalations in a compressed game month, not a real partner’s meeting schedule. The status, action-specific cost, used action, and next availability are visible across routes. Manual collections and staff recovery retain independent monthly limits; reports, ordinary administration, and delegated work do not consume attention.
- **Lead recovery meeting** costs $1,000 cash and current-month profit, raises satisfaction by up to 6, and collects 15% of that client’s overdue receivables up to $3,000. A pending complaint is an eligibility reason, including at satisfaction 70–74. Inbox and Clients use the same transition, resolving the complaint once without stacking another reward. Meetings do not guarantee renewal or fix understaffing. A personal collection call uses its existing collection formula and has no meeting fee.
- **Delegate routine response** requires a billable employee and uses the already-paid team: up to +3 satisfaction, no extra expense or partner attention, and no service-capacity increase. Explicit deferral closes the response decision with a 10-point satisfaction reduction (bounded at zero).
- Finance actions preview their modeled effects. **Write off and close collection efforts** clears the selected AR amount and lowers profit by the same amount without bringing in cash; that amount can no longer be collected in this model. The game combines an accounting write-off with ending collection; an accounting write-off alone does not necessarily cancel a debt.
- A new-client inbox offer gives aggressive pursuit a 70% signing chance for a $3,000 immediate cash and profit cost, paid even when the prospect declines. Initial contact has a 50% chance without that cost. A signed client adds a $15,000 monthly fee and service demand; the player sees the choice terms before deciding, including in an older pending offer.
- Payroll: salary + 25% benefits + 7.65% FICA
- Immediately before the monthly staff update, one coverage snapshot sets burnout pressure: below 90% adds 6; 90–under 100% adds 3; 100–under 115% leaves it unchanged; 115% or higher subtracts 3. No clients also subtracts 3. Burnout stays within 0–100. Service, satisfaction, and renewals then use the updated roster. These bands are fictional design assumptions. Routine monthly burnout no longer changes efficacy; explicit staff scenarios still can.
- Staff recovery costs $1,500 per eligible employee (20+ burnout), covers up to 12 staff once per month, and reduces burnout by up to 25 points. It requires enough cash and appears in the current-month P&L, Payroll budget actuals, and cash waterfall. Recovery addresses fatigue; adequate capacity addresses continuing overload. Neither recovery plan increases permanent efficacy.
- Targeted recovery covers up to two highest-burnout eligible staff for $500 each, reducing burnout by up to 15 points. When cash covers only one place, the quote scales down to $500. Full and targeted recovery share one use per month and the same accounting entries.
- Manual **Increase salary** accepts finite increases, treats the current amount as a no-op, and rejects decreases against the latest roster. The preview shows loaded recurring payroll beginning with the next month advance. Salaries are commitments; salary reductions and renegotiations are not simulated. Existing inbox raise negotiations remain available.
- Line of credit with 8% annual interest (auto-draw/repay)
- When remaining credit is 20% or less of the limit, the dashboard shows the remaining amount and links directly to the Cash Flow tab's borrowing and repayment controls.
- A monthly cash waterfall separates collections, recurring costs, one-time decisions, partner distributions, and credit-line draws/repayments. Older saves retain unexplained prior movements as unclassified rather than assigning them a fictional cause.
- The game books a fictional 25% estimated tax expense on positive pretax profit when each month opens. It records the unpaid amount separately from cash. A fictional 2% late charge applies to unpaid tax principal at the start of each quarter; existing penalties do not compound. Quarter-end inbox decisions can pay all, pay 60%, or defer, with payments clearing penalties first. The estimate stays fixed if later decisions change that month’s profit.
- Quarterly budget tracking with variance analysis
- Hiring cost: $5K | Severance: $2K

### Reproducible balance simulation

Run `bun run scripts/balance-report.ts` for a seeded 24-month free-play simulation across five seeds and scripted decision policies, including a cash-pressure policy that uses staff recovery. The JSON report includes cash and credit use, profit, service, churn and renewals, burnout and efficacy, reputation, and pending decisions. Use `--months=12` to shorten the run. Run `bun run scripts/case-branch-report.ts` for three January–April guided-case decision paths from the same fixture. Policies respect shared attention and delegate when personal handling is unavailable. The [service balance check](docs/service-balance-simulation.md) records model results, not human learning evidence. Removing random burnout rolls changes subsequent random sequences; whole-run differences are not controlled estimates of any one rule’s effect.

Stages 1–3 implement slices A–C in the [learning-improvement plan](docs/learning-improvement-plan.md): truthful rules, the authored case, and guided decisions with an April review. Slice D freezes the exact opening fixture, adds a scripted case-branch balance report, and provides a [facilitator-ready learning study kit](docs/learning-study-kit.md) with distinct [pretest](docs/learning-study-pretest.md) and [posttest](docs/learning-study-posttest.md) questions. The [playtest notes](docs/new-player-playtest.md) describe technical rehearsal. Human study sessions are pending; completing the case or passing technical checks is not evidence of demonstrated mastery. Valid version 1–4 firm saves remain supported. Retired tutorial progress is kept as legacy progress without assigning old step numbers to new case lessons; a saved meeting still counts as a spent partner intervention for that month.

Reputation summarizes client satisfaction and staff efficacy; it does not alter acquisition or recruitment. Attorney and lobbyist capacity is pooled without specialist matching or distinct legal capabilities. Numerical margin, reserves, staffing, and valuation targets are simulation assumptions. Client concentration concerns fee exposure and shared issues, not organization types alone; shared issue exposure is not calculated by this version.

This is an educational game model, not a full accounting ledger or a model of real tax obligations. The cash projection is a simple run-rate estimate rather than a forecast of future decisions or collections.

### Guided Experience

The short orientation introduces the partner role, the three-month objective, and where to find the current decision. January practices cash versus profit, February practices scope, conflict review, and capacity, and March practices service and attention under an external policy delay. Each round has one brief prediction and reflection, with feedback drawn from actual game outcomes. April reviews the decisions and asks the player to apply a principle to a fresh situation. The six intended lessons are practice goals, not a score or a claim of measured learning.

The former 34-step, 13-topic tutorial is retired for new players. Its saved progress is treated as legacy history, without converting old steps into unrelated case lessons. Game and guidance progress are saved together in this browser; saves do not sync across devices.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript type checking |
| `bun test` | Run focused simulation, guided-case, scenario, and save-state tests |
| `bun run scripts/balance-report.ts` | Print the seeded 12–24 month balance simulation report |
| `bun run scripts/case-branch-report.ts` | Print five-seed January–April guided-case branch results |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for educational purposes.

## Acknowledgments

- Built with Next.js 16 and React 19
- UI components from Material UI
- Charts powered by Recharts
