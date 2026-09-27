# Managing Partner - Government Relations Simulator

> An educational business simulation about managing a government relations firm.

## Overview

**Managing Partner** is a business simulation game where players take on the role of a managing partner at a mid-size government relations firm in Washington, D.C. Make strategic decisions about finances, human resources, and client relationships to grow your firm's reputation and profitability. An interactive tutorial system guides new players through the fundamentals of GR industry management.

This is a playable prototype with a simplified financial model. Progress is saved in the current browser; a confirmed **New Game** action resets the simulation and tutorial together. Valid version 1–3 saves migrate to the current version 4 format on load.

## Features

- **Dashboard Overview**: Real-time KPIs including cash position, collections, operating margin, DSO, and reputation, plus a link to credit controls when available borrowing capacity runs low
- **Financial Management**: 5-tab interface with P&L statements, budget tracking, client-attributed AR aging, a reconciled cash waterfall, tax balance, and partner economics
- **HR Management**: Manage lobbyists, attorneys, and support staff; choose a full or lower-cost targeted recovery program to reduce burnout and restore efficacy
- **Client Relations**: Monitor satisfaction, service coverage, contract timelines, renewals, churn, and revenue across corporations, trade associations, and non-profits; pursue new clients and handle feedback through inbox decisions
- **Inbox System**: Handle scenario-based decisions including compensation requests, vendor contracts, budget overruns, tax payments, and new business opportunities; pending decisions remain available and completed messages show the actual outcome
- **Interactive Tutorial**: 34-step guided tutorial across 4 phases teaching GR industry fundamentals and firm management
- **Help System**: Searchable glossary with 55+ industry terms, contextual help tooltips on every metric, and a floating help button
- **Local Save**: Simulation decisions, receivables, cash activity, inbox outcomes, and tutorial progress resume together after a reload

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
│   │   └── SideNav.tsx           # Navigation, tutorial progress, and New Game
│   ├── finances/
│   │   ├── PLStatement.tsx       # Income statement
│   │   ├── BudgetTracker.tsx     # Quarterly budget tracking
│   │   ├── ARManager.tsx         # Accounts receivable aging
│   │   ├── CashFlowView.tsx      # Cash flow statement
│   │   └── PartnerEconomicsView.tsx  # Partner draws & distributions
│   ├── hr/
│   │   └── StaffingEconomics.tsx # Total cost of workforce analysis
│   ├── tutorial/
│   │   ├── WelcomeModal.tsx      # First-time user onboarding
│   │   ├── TutorialOverlay.tsx   # Spotlight overlay for guided steps
│   │   ├── TutorialProgressBar.tsx   # Sidebar progress indicator
│   │   └── LearningObjectivesCard.tsx # Learning objectives display
│   └── help/
│       ├── HelpFab.tsx           # Floating help button
│       ├── GlossaryDrawer.tsx    # Searchable glossary drawer
│       └── HelpTooltip.tsx       # Contextual help on metrics
├── context/
│   ├── SessionContext.tsx         # One versioned browser-local save
│   ├── SimulationContext.tsx      # Simulation actions
│   └── TutorialContext.tsx        # Tutorial actions
├── lib/
│   ├── simulation/               # Pure transitions and shared financial metrics
│   └── session/                  # Save loading, validation, and defaults
├── data/
│   ├── tutorialSteps.ts          # 34 tutorial steps across 4 phases
│   ├── learningObjectives.ts     # 13 learning objectives
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

### Financial Model

- Simplified accrual P&L and cash tracking — client fees are billed as revenue; collections drive cash
- AR aging in 4 buckets (0-30, 31-60, 61-90, 90+ days), tracked by client and collected using each client's payment profile
- Receivables from former clients remain visible and collectible. Opening balances and migrated version 1 balances with no known client stay explicitly labeled as unassigned rather than being attributed to a current client.
- Contracts resolve when their remaining term reaches zero. Retained clients start a new 12-month term; clients who leave stop generating invoices, while their existing receivables continue to age and be collected. Dashboard alerts name the outcome.
- Lobbyists and attorneys provide client service capacity based on efficacy, client affinity, and high burnout. Effective support staff improve how much of that capacity reaches clients. The initial four billable staff and one support employee cover roughly eight clients. A shortfall lowers monthly satisfaction and renewal odds; with no billable staff, contracts cannot renew. A dashboard service indicator and month-end alerts explain shortfalls.
- The manual **Run Collections** action can be attempted once per simulation month when receivables are overdue. It is recorded in the local save and becomes available again next month.
- Payroll: salary + 25% benefits + 7.65% FICA
- Staff recovery costs $1,500 per eligible employee (20+ burnout), covers up to 12 staff once per month, reduces burnout by up to 25 points and restores up to 5 efficacy points per person. It requires enough cash and appears in the current-month P&L, Payroll budget actuals, and cash waterfall.
- Targeted recovery covers up to two highest-burnout eligible staff for $500 each, reducing burnout by up to 15 points and restoring up to 3 efficacy points per person. When cash covers only one place, the quote scales down to $500. The full and targeted choices share one use per month; both require cash and use the same accounting entries.
- Line of credit with 8% annual interest (auto-draw/repay)
- When remaining credit is 20% or less of the limit, the dashboard shows the remaining amount and links directly to the Cash Flow tab's borrowing and repayment controls.
- A monthly cash waterfall separates collections, recurring costs, one-time decisions, partner distributions, and credit-line draws/repayments. Older saves retain unexplained prior movements as unclassified rather than assigning them a fictional cause.
- The game books a fictional 25% estimated tax expense on positive pretax profit when each month opens. It records the unpaid amount separately from cash. A fictional 2% late charge applies to unpaid tax principal at the start of each quarter; existing penalties do not compound. Quarter-end inbox decisions can pay all, pay 60%, or defer, with payments clearing penalties first. The estimate stays fixed if later decisions change that month’s profit.
- Quarterly budget tracking with variance analysis
- Hiring cost: $5K | Severance: $2K

### Reproducible balance simulation

Run `bun run scripts/balance-report.ts` for a seeded 24-month simulation across five seeds and scripted decision policies, including a cash-pressure policy that uses staff recovery. The JSON report includes cash and credit use, profit, client churn and renewals, staff burnout and efficacy, reputation, and pending inbox volume. Use `--months=12` to shorten the run. The [current service balance check](docs/service-balance-simulation.md) records results under the revised staffing rules. These are **simulation outcomes**, not observations from human play sessions. A [new-player playtest script](docs/new-player-playtest.md) is ready for the next validation step.

This is an educational game model, not a full accounting ledger or a model of real tax obligations. The cash projection is a simple run-rate estimate rather than a forecast of future decisions or collections.

### Tutorial System

A 34-step interactive tutorial spanning 4 phases:

1. **Welcome**: GR industry introduction and game mechanics overview
2. **Month 1 — Getting Your Bearings**: Dashboard, finances, team, and HR fundamentals
3. **Month 2 — Client Management & Decision-Making**: Client types, satisfaction, and inbox decisions
4. **Month 3 — Strategic Thinking**: Trend analysis, resource allocation, reputation, and hiring decisions

Covers 13 learning objectives from understanding GR industry basics to strategic firm management. Game and tutorial progress are saved together in this browser; saves do not sync across devices.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript type checking |
| `bun test` | Run focused simulation, scenario, tutorial, and save-state tests |
| `bun run scripts/balance-report.ts` | Print the seeded 12–24 month balance simulation report |

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
