# Active Context: Managing Partner - Government Relations Simulator

## Current State

**Project Status**: ✅ In Development - Business Simulation Game

This is a business simulation game where players manage a government relations firm. The application features:
- Dashboard with financial charts (Recharts)
- Financial management, HR, Clients, Inbox pages
- SimulationContext for global state management
- MUI for UI components

## Recently Completed

- [x] Fixed react-router-dom import (changed to Next.js Link)
- [x] Fixed SimulationContext setState implementation
- [x] Created missing pages (finances, hr, clients, inbox)
- [x] Created comprehensive README.md
- [x] Implemented Advance Month functionality

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
| `src/context/SimulationContext.tsx` | Global simulation state | ✅ Ready |
| `src/pages/Dashboard.tsx` | Main dashboard component | ✅ Ready |
| `README.md` | Project documentation | ✅ Ready |

## Current Focus

Building a business simulation game where players take on the role of Managing Partner at a government relations firm. Focus on gameplay mechanics, UI/UX, and simulation logic.

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-11 | Bug fixes: react-router-dom to Next.js Link, SimulationContext setState, created missing pages, created README, implemented Advance Month |
