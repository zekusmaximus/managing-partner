# Managing Partner - Government Relations Simulator

> A hyper-accurate, serious educational simulator for executive management techniques in government relations firms.

## Overview

**Managing Partner** is a business simulation game where players take on the role of a managing partner at a mid-size government relations firm in Washington, D.C. Make strategic decisions about finances, human resources, and client relationships to grow your firm's reputation and profitability. An interactive tutorial system guides new players through the fundamentals of GR industry management.

## Features

- **Dashboard Overview**: Real-time KPIs including cash position, collections, operating margin, DSO, and reputation
- **Financial Management**: 5-tab interface with P&L statements, budget tracking, AR aging, cash flow analysis, and partner economics
- **HR Management**: Manage lobbyists, attorneys, and support staff — track efficacy, burnout, salary, and staffing economics
- **Client Relations**: Monitor satisfaction, contract timelines, and revenue across corporations, trade associations, and non-profits
- **Inbox System**: Handle scenario-based decisions including compensation requests, vendor contracts, budget overruns, and new business opportunities
- **Interactive Tutorial**: 34-step guided tutorial across 4 phases teaching GR industry fundamentals and firm management
- **Help System**: Searchable glossary with 55+ industry terms, contextual help tooltips on every metric, and a floating help button

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

- Bun (recommended) or Node.js 18+

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
│   │   ├── TopNav.tsx            # Top navigation with alerts & inbox count
│   │   └── SideNav.tsx           # Side navigation with tutorial progress
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
│   ├── SimulationContext.tsx      # Core game state & logic
│   └── TutorialContext.tsx        # Tutorial state & persistence
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
- **Financials**: Cash on hand, revenue, expenses, collections, profit, accounts receivable (4-bucket aging), line of credit
- **Employees**: Lobbyists, attorneys, and support staff with efficacy, burnout, salary, and client affinity metrics
- **Clients**: Corporations, trade associations, and non-profits with satisfaction, contract terms, and payment profiles (prompt/normal/slow)
- **Reputation**: Overall firm reputation (0-100)
- **Operating Costs**: Rent, insurance, technology, compliance, miscellaneous
- **Vendors**: Third-party service providers with contract tracking
- **Partner Economics**: Monthly draws and distribution pools

### Financial Model

- Cash-flow-driven accounting — collections drive cash position, not accrued revenue
- AR aging in 4 buckets (0-30, 31-60, 61-90, 90+ days) with collection rates based on client payment profiles
- Payroll: salary + 25% benefits + 7.65% FICA
- Line of credit with 8% annual interest (auto-draw/repay)
- Quarterly budget tracking with variance analysis
- Hiring cost: $5K | Severance: $2K

### Tutorial System

A 34-step interactive tutorial spanning 4 phases:

1. **Welcome**: GR industry introduction and game mechanics overview
2. **Month 1 — Getting Your Bearings**: Dashboard, finances, team, and HR fundamentals
3. **Month 2 — Client Management & Decision-Making**: Client types, satisfaction, and inbox decisions
4. **Month 3 — Strategic Thinking**: Trend analysis, resource allocation, reputation, and hiring decisions

Covers 13 learning objectives from understanding GR industry basics to strategic firm management. Progress persists across sessions via localStorage.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript type checking |

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
