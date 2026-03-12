# Managing Partner - Implementation Plan

## Project Status
- **Current Completion**: ~15-20%
- **Goal**: Fully functional business simulation game

---

## Phase 1: Core Game Mechanics (Priority: HIGH)

### 1.1 Extend SimulationContext with Actions
**File**: `src/context/SimulationContext.tsx`

Add the following functions:
- `advanceMonth()` - Progress simulation by one month, trigger monthly calculations
- `hireEmployee(employee)` - Add new employee to roster
- `fireEmployee(employeeId)` - Remove employee
- `adjustSalary(employeeId, newSalary)` - Change employee salary
- `addClient(client)` - Add new client
- `removeClient(clientId)` - Lose a client
- `updateClientSatisfaction(clientId, delta)` - Adjust satisfaction
- `updateFinancials(revenue, expenses)` - Monthly financial calculations

### 1.2 Add Financial Tracking History
**File**: `src/context/SimulationContext.tsx`

Add state for:
- `financialHistory: { month, year, revenue, expenses, profit }[]`
- Monthly snapshots for charting

### 1.3 Add Alert System
**File**: `src/context/SimulationContext.tsx`

Add:
- `alerts: Alert[]` - Dynamic alerts based on game state
- Auto-generate alerts on: overdue invoices, low client satisfaction, employee burnout, contract expiry

---

## Phase 2: Dashboard Improvements (Priority: HIGH)

### 2.1 Use Real Financial Data in Chart
**File**: `src/pages/Dashboard.tsx`

- Replace hardcoded `data` array with `state.financialHistory`
- Connect to `advanceMonth()` function

### 2.2 Dynamic Alerts
**File**: `src/pages/Dashboard.tsx`

- Replace hardcoded alerts with `state.alerts`
- Filter by severity

### 2.3 Add Quick Stats Cards
**File**: `src/pages/Dashboard.tsx`

Add cards showing:
- Current Cash on Hand
- Current Month Revenue/Expenses
- Average Employee Burnout
- Average Client Satisfaction
- Firm Reputation

---

## Phase 3: Financial Management Page (Priority: MEDIUM)

### 3.1 Complete Finances Page
**File**: `src/app/finances/page.tsx`

Components to add:
- **Summary Cards**: Cash, Revenue, Expenses, Profit, AR
- **Revenue/Expense Chart**: Line or bar chart showing history
- **Monthly Breakdown Table**: Detailed transactions
- **Cash Flow Statement**: Operating, Investing, Financing sections
- **Accounts Receivable Table**: List of overdue invoices

### 3.2 Financial Actions
Add buttons for:
- "Advance Month" (also available in TopNav)
- View detailed reports

---

## Phase 4: HR Management Page (Priority: MEDIUM)

### 4.1 Complete HR Page
**File**: `src/app/hr/page.tsx`

Components to add:
- **Employee Table**: Name, Role, Efficacy, Burnout, Salary, Affinity
- **Efficacy/ Burnout Visual**: Progress bars or color coding
- **Add Employee Modal**: Form to hire new staff
- **Fire Employee Action**: Remove staff

### 4.2 Employee Metrics Display
- Role distribution chart (pie chart)
- Average burnout by department
- Total payroll costs

---

## Phase 5: Client Relations Page (Priority: MEDIUM)

### 5.1 Complete Clients Page
**File**: `src/app/clients/page.tsx`

Components to add:
- **Client Table**: Name, Type, Fee, Satisfaction, Contract
- **Satisfaction Indicators**: Color-coded chips
- **Contract Status**: Expiring soon warnings
- **Add Client Form**: New client onboarding

### 5.2 Client Analytics
- Revenue by client type
- Contract renewal timeline
- Satisfaction trends

---

## Phase 6: Inbox System (Priority: MEDIUM)

### 6.1 Inbox Data Structure
**File**: `src/context/SimulationContext.tsx`

Add:
```typescript
export interface InboxMessage {
  id: string;
  type: 'request' | 'alert' | 'opportunity';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  requiresAction: boolean;
  choices?: { label: string; action: () => void }[];
  read: boolean;
  timestamp: Date;
}
```

### 6.2 Complete Inbox Page
**File**: `src/app/inbox/page.tsx`

Components:
- **Message List**: Sortable by urgency, date, read status
- **Message Detail Panel**: Full message with action buttons
- **Action System**: Choices that affect game state when clicked

### 6.3 Message Types
Generate messages for:
- Client complaints (affect satisfaction)
- Employee requests (raise, vacation)
- Business opportunities (new clients)
- Contract renewals
- Financial alerts

---

## Phase 7: Navigation & UX (Priority: LOW)

### 7.1 TopNav Enhancements
**File**: `src/components/layout/TopNav.tsx`

- Add "Advance Month" button
- Display current Month/Year
- Show notification badge for unread inbox

### 7.2 SideNav Highlights
- Highlight current active page

---

## Implementation Order (Step by Step)

- [x] Step 1: Extend SimulationContext with `advanceMonth()` and financial history tracking
- [x] Step 2: Update Dashboard to use real data and add stats cards
- [x] Step 3: Build complete Finances page
- [x] Step 4: Build complete HR page with employee management
- [x] Step 5: Build complete Clients page
- [x] Step 6: Implement Inbox message system and page
- [x] Step 7: Add TopNav month advancement and polish

---

## Technical Notes

- Use MUI components for consistency
- Keep Recharts for all visualizations
- Maintain TypeScript types in SimulationContext
- All game logic should flow through SimulationContext (single source of truth)
- Consider adding localStorage persistence for game state

---

## Dependencies

All required packages appear to be installed:
- Next.js 16.x
- React 19.x
- MUI 7.x
- Recharts 3.x
- Tailwind CSS 4.x

No additional installations required.

