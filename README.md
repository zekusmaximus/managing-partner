# Managing Partner - Government Relations Simulator

> A hyper-accurate, serious educational simulator for executive management techniques in government relations firms.

## Overview

**Managing Partner** is a business simulation game where players take on the role of a managing partner at a government relations firm. Make strategic decisions about finances, human resources, and client relationships to grow your firm's reputation and profitability.

## Features

- **Dashboard Overview**: Real-time view of financial health, client satisfaction, and key alerts
- **Financial Management**: Track revenue, expenses, and cash flow
- **HR Management**: Manage employees, their efficacy, burnout levels, and salaries
- **Client Relations**: Monitor client satisfaction and contract status
- **Inbox System**: Handle requests and decisions as they come in

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
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home/Dashboard page
│   ├── layout.tsx         # Root layout with providers
│   ├── finances/          # Finances page
│   ├── hr/                # HR/Roster page
│   ├── clients/           # Clients page
│   ├── inbox/             # Inbox page
│   └── globals.css        # Global styles
├── components/
│   └── layout/
│       ├── TopNav.tsx     # Top navigation bar
│       └── SideNav.tsx    # Side navigation drawer
├── context/
│   └── SimulationContext.tsx  # Global simulation state
└── pages/
    └── Dashboard.tsx      # Main dashboard component
```

## Game Mechanics

### Simulation State

The game tracks the following state:

- **Month/Year**: Current simulation date
- **Financials**: Cash on hand, revenue, expenses, profit, accounts receivable
- **Employees**: Staff with efficacy, burnout, salary, and client affinity metrics
- **Clients**: Client roster with satisfaction scores and contract terms
- **Reputation**: Overall firm reputation (0-100)

### Key Actions

- **Advance Month**: Progress the simulation to the next month (increments date, triggers monthly calculations)

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
