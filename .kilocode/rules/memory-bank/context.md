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
| `src/app/providers.tsx` | Client-only app providers (MUI Theme + Simulation) | ✅ Ready |
| `src/context/SimulationContext.tsx` | Global simulation state | ✅ Ready |
| `src/components/dashboard/Dashboard.tsx` | Main dashboard component | ✅ Ready |
| `README.md` | Project documentation | ✅ Ready |

## Current Focus

Building a business simulation game where players take on the role of Managing Partner at a government relations firm. Focus on gameplay mechanics, UI/UX, and simulation logic.

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
