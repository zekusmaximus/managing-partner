import type { Alert, ARBuckets, BudgetItem, Client, Financials, FinancialHistoryEntry, InboxMessage, ReceivableAccount, SimulationState } from '@/types/simulation';
import { AR_COLLECTION_RATES, getEmployeeTotalCost, getOperatingCostsTotal, getLOCMonthlyInterest } from '@/types/simulation';

export interface EngineDeps {
  random: () => number;
  generateAlerts: (state: SimulationState) => Alert[];
  generateInboxMessages: (state: SimulationState) => InboxMessage[];
}

const getCurrentQuarter = (month: number) => Math.ceil(month / 3);

export const isValidAmount = (amount: number, allowZero = false): boolean =>
  Number.isFinite(amount) && (allowZero ? amount >= 0 : amount > 0);

export const recordCurrentCash = (state: SimulationState, cashOnHand: number, collections = 0): SimulationState => ({
  ...state,
  financials: { ...state.financials, cashOnHand, collectionsThisMonth: state.financials.collectionsThisMonth + collections },
  financialHistory: state.financialHistory.map((entry, index, history) =>
    index === history.length - 1 && entry.month === state.month && entry.year === state.year
      ? { ...entry, cashOnHand, collections: entry.collections + collections }
      : entry),
});

export const sumReceivables = (accounts: ReceivableAccount[]): ARBuckets =>
  accounts.reduce<ARBuckets>((total, account) => ({
    current: total.current + account.aging.current,
    thirtyDay: total.thirtyDay + account.aging.thirtyDay,
    sixtyDay: total.sixtyDay + account.aging.sixtyDay,
    ninetyPlus: total.ninetyPlus + account.aging.ninetyPlus,
  }), { current: 0, thirtyDay: 0, sixtyDay: 0, ninetyPlus: 0 });

const collectAtRate = (balance: number, rate: number): number =>
  Math.min(balance, Math.round(balance * rate));

export const getOverdueClientAccount = (state: SimulationState): ReceivableAccount | undefined =>
  state.receivables.reduce<ReceivableAccount | undefined>((highest, account) => {
    if (account.clientId === null || account.aging.sixtyDay <= 0 ||
      !state.clients.some(client => client.id === account.clientId)) return highest;
    return !highest || account.aging.sixtyDay > highest.aging.sixtyDay ? account : highest;
  }, undefined);

export const collectOverdueReceivables = (state: SimulationState): SimulationState => {
  let collected = 0;
  const receivables = state.receivables.map(account => {
    const thirtyDay = collectAtRate(account.aging.thirtyDay, 0.3);
    const sixtyDay = collectAtRate(account.aging.sixtyDay, 0.3);
    const ninetyPlus = collectAtRate(account.aging.ninetyPlus, 0.15);
    collected += thirtyDay + sixtyDay + ninetyPlus;
    return {
      ...account,
      aging: {
        ...account.aging,
        thirtyDay: account.aging.thirtyDay - thirtyDay,
        sixtyDay: account.aging.sixtyDay - sixtyDay,
        ninetyPlus: account.aging.ninetyPlus - ninetyPlus,
      },
    };
  });
  if (collected === 0) return state;
  return recordCurrentCash({ ...state, receivables, arAging: sumReceivables(receivables) },
    state.financials.cashOnHand + collected, collected);
};

export const writeOffReceivables = (state: SimulationState, amount: number, bucket: keyof ARBuckets = 'ninetyPlus', clientId?: string): SimulationState => {
  if (!isValidAmount(amount)) return state;
  let remaining = amount;
  const receivables = state.receivables.map(account => {
    if (remaining <= 0 || (clientId !== undefined && account.clientId !== clientId)) return account;
    const reduction = Math.min(remaining, account.aging[bucket]);
    remaining -= reduction;
    return reduction > 0
      ? { ...account, aging: { ...account.aging, [bucket]: account.aging[bucket] - reduction } }
      : account;
  });
  const writeOff = amount - remaining;
  if (writeOff <= 0) return state;
  return {
    ...state,
    receivables,
    arAging: sumReceivables(receivables),
    financials: {
      ...state.financials,
      operatingExpenses: state.financials.operatingExpenses + writeOff,
      netProfit: state.financials.netProfit - writeOff,
    },
    financialHistory: state.financialHistory.map((entry, index, history) =>
      index === history.length - 1 && entry.month === state.month && entry.year === state.year
        ? { ...entry, expenses: entry.expenses + writeOff, profit: entry.profit - writeOff, arWriteOff: entry.arWriteOff + writeOff }
        : entry),
  };
};

export const reallocateBudget = (budget: BudgetItem[], category: string, quarter: number, year: number): BudgetItem[] => {
  const target = budget.find(item => item.category === category && item.quarter === quarter && item.year === year);
  if (!target) return budget;
  const deficit = Math.max(0, target.actualQuarterlySpend - target.plannedQuarterly);
  if (deficit === 0) return budget;
  let remaining = deficit;
  return budget.map(item => {
    if (item.quarter !== quarter || item.year !== year || item.category === category || remaining === 0) return item;
    const available = Math.max(0, item.plannedQuarterly - item.actualQuarterlySpend);
    const moved = Math.min(available, remaining);
    remaining -= moved;
    return moved > 0 ? { ...item, plannedQuarterly: item.plannedQuarterly - moved } : item;
  }).map(item => item.category === category && item.quarter === quarter && item.year === year
    ? { ...item, plannedQuarterly: item.plannedQuarterly + deficit - remaining }
    : item);
};

export const advanceSimulationMonth = (prevState: SimulationState, deps: EngineDeps): SimulationState => {
      const newMonth = prevState.month === 12 ? 1 : prevState.month + 1;
      const newYear = prevState.month === 12 ? prevState.year + 1 : prevState.year;
      const quarter = getCurrentQuarter(newMonth);

      // 1. Update employees (burnout/efficacy)
      const updatedEmployees = prevState.employees.map(emp => {
        let newBurnout = Math.min(100, emp.burnout + Math.floor(deps.random() * 5) + 2);
        let newEfficacy = Math.max(0, emp.efficacy - Math.floor(newBurnout / 20));
        if (newBurnout < 30) {
          newEfficacy = Math.min(100, newEfficacy + 2);
        }
        return { ...emp, burnout: newBurnout, efficacy: newEfficacy };
      });

      // 2. Update clients (satisfaction/contracts)
      let updatedClients = prevState.clients.map(client => ({
        ...client,
        satisfaction: Math.max(0, Math.min(100, client.satisfaction + (Math.floor(deps.random() * 11) - 5))),
        contractMonthsRemaining: Math.max(0, client.contractMonthsRemaining - 1),
      }));
      updatedClients = updatedClients.filter(client => {
        if (client.contractMonthsRemaining === 0) return deps.random() > 0.3;
        return true;
      });

      // 3. Revenue recognition — new invoices go to AR current bucket
      const monthlyRevenue = updatedClients.reduce((sum, c) => sum + c.monthlyFee, 0);

      // 4. Collect and age each account using its own payment profile. Keep
      // balances after a client leaves; only new invoices require an active client.
      let totalCollections = 0;
      let autoWriteOff = 0;
      const newReceivables = prevState.receivables.map(account => {
        const prior = account.aging;
        const rates = AR_COLLECTION_RATES[account.paymentProfile];
        const currentCollected = collectAtRate(prior.current, rates.current);
        const thirtyCollected = collectAtRate(prior.thirtyDay, rates.thirtyDay);
        const sixtyCollected = collectAtRate(prior.sixtyDay, rates.sixtyDay);
        const ninetyCollected = collectAtRate(prior.ninetyPlus, rates.ninetyPlus);
        const badDebt = collectAtRate(prior.ninetyPlus - ninetyCollected, 0.2);
        totalCollections += currentCollected + thirtyCollected + sixtyCollected + ninetyCollected;
        autoWriteOff += badDebt;
        return {
          ...account,
          aging: {
            current: 0,
            thirtyDay: prior.current - currentCollected,
            sixtyDay: prior.thirtyDay - thirtyCollected,
            ninetyPlus: prior.sixtyDay - sixtyCollected + prior.ninetyPlus - ninetyCollected - badDebt,
          },
        };
      });

      for (const client of updatedClients) {
        const existingIndex = newReceivables.findIndex(account => account.clientId === client.id);
        if (existingIndex >= 0) {
          const account = newReceivables[existingIndex];
          newReceivables[existingIndex] = {
            ...account,
            clientName: client.name,
            paymentProfile: client.paymentProfile,
            aging: { ...account.aging, current: account.aging.current + client.monthlyFee },
          };
        } else {
          newReceivables.push({
            clientId: client.id,
            clientName: client.name,
            paymentProfile: client.paymentProfile,
            aging: { current: client.monthlyFee, thirtyDay: 0, sixtyDay: 0, ninetyPlus: 0 },
          });
        }
      }
      const newAR = sumReceivables(newReceivables);

      // 5. Calculate all expenses
      const totalPayroll = updatedEmployees.reduce((sum, emp) => sum + getEmployeeTotalCost(emp), 0);
      const opCosts = getOperatingCostsTotal(prevState.operatingCosts);
      const vendorCosts = prevState.vendors.reduce((sum, v) => sum + v.monthlyCost, 0);
      const partnerDraw = prevState.partnerEconomics.monthlyDraw;
      const locInterest = getLOCMonthlyInterest(prevState.lineOfCredit);
      const cashExpenses = totalPayroll + opCosts + vendorCosts + partnerDraw + locInterest;
      const totalExpenses = cashExpenses + autoWriteOff;

      // 6. Cash flow: cash += collections - expenses
      let newCash = prevState.financials.cashOnHand + totalCollections - cashExpenses;

      // 7. Line of credit mechanics
      let newLOC = { ...prevState.lineOfCredit };
      if (newCash < 20000 && newLOC.drawn < newLOC.limit) {
        // Auto-draw to bring cash to $50K
        const drawAmount = Math.min(50000 - newCash, newLOC.limit - newLOC.drawn);
        if (drawAmount > 0) {
          newCash += drawAmount;
          newLOC = { ...newLOC, drawn: newLOC.drawn + drawAmount };
        }
      } else if (newCash > 80000 && newLOC.drawn > 0) {
        // Auto-repay
        const repayAmount = Math.min(newCash - 60000, newLOC.drawn);
        if (repayAmount > 0) {
          newCash -= repayAmount;
          newLOC = { ...newLOC, drawn: newLOC.drawn - repayAmount };
        }
      }

      // 8. Partner economics — accumulate to distribution pool
      const netProfit = monthlyRevenue - totalExpenses;
      let newPartnerEconomics = { ...prevState.partnerEconomics };
      if (netProfit > 0) {
        newPartnerEconomics.distributionPool += Math.round(netProfit * 0.4); // 40% of profit to distribution pool
      }

      // 9. Budget tracking — update actual spend for current quarter
      // Create the new quarter before recording its opening month's spend.
      const newBudget = [...prevState.budget];
      if (!newBudget.some(b => b.quarter === quarter && b.year === newYear)) {
        const lastQuarter = quarter === 1 ? 4 : quarter - 1;
        const lastYear = quarter === 1 ? newYear - 1 : newYear;
        const lastBudgets = newBudget.filter(b => b.quarter === lastQuarter && b.year === lastYear);
        for (const prior of lastBudgets) {
          newBudget.push({ ...prior, actualQuarterlySpend: 0, quarter, year: newYear });
        }
      }
      const recordedBudget = newBudget.map(b => {
        if (b.quarter === quarter && b.year === newYear) {
          let monthlyActual = 0;
          switch (b.category) {
            case 'Payroll': monthlyActual = totalPayroll; break;
            case 'Rent': monthlyActual = prevState.operatingCosts.rent; break;
            case 'Insurance': monthlyActual = prevState.operatingCosts.insurance; break;
            case 'Technology': monthlyActual = prevState.operatingCosts.technology; break;
            case 'Compliance': monthlyActual = prevState.operatingCosts.compliance; break;
            case 'Vendors': monthlyActual = vendorCosts; break;
            case 'Partner Draw': monthlyActual = partnerDraw; break;
            case 'Misc': monthlyActual = prevState.operatingCosts.misc; break;
          }
          return { ...b, actualQuarterlySpend: b.actualQuarterlySpend + monthlyActual };
        }
        return b;
      });

      // Update vendor contract durations
      const updatedVendors = prevState.vendors.map(v => ({
        ...v,
        contractMonths: Math.max(0, v.contractMonths - 1),
      }));

      // Update reputation
      const avgClientSatisfaction = updatedClients.length > 0
        ? updatedClients.reduce((sum, c) => sum + c.satisfaction, 0) / updatedClients.length
        : 50;
      const avgEmployeeEfficacy = updatedEmployees.length > 0
        ? updatedEmployees.reduce((sum, e) => sum + e.efficacy, 0) / updatedEmployees.length
        : 50;
      let newReputation = Math.round((avgClientSatisfaction * 0.6) + (avgEmployeeEfficacy * 0.4));
      newReputation = Math.max(0, Math.min(100, newReputation + (deps.random() > 0.5 ? 1 : -1)));

      // Financial history
      const newHistoryEntry: FinancialHistoryEntry = {
        month: newMonth, year: newYear,
        revenue: monthlyRevenue, expenses: totalExpenses, profit: netProfit,
        collections: totalCollections, operatingCosts: opCosts, operatingCostBreakdown: { ...prevState.operatingCosts }, vendorCosts,
        partnerDraw, payroll: totalPayroll, arWriteOff: autoWriteOff,
        locInterest, cashOnHand: newCash,
      };
      const newHistory = [...prevState.financialHistory, newHistoryEntry].slice(-12);

      // Build new state for alert/inbox generation
      const newFinancials: Financials = {
        cashOnHand: newCash,
        grossRevenue: monthlyRevenue,
        operatingExpenses: totalExpenses,
        netProfit,
        collectionsThisMonth: totalCollections,
        totalPayroll,
        totalOperatingCosts: opCosts,
        totalVendorCosts: vendorCosts,
        partnerDrawThisMonth: partnerDraw,
        locInterestThisMonth: locInterest,
      };

      const nextState: SimulationState = {
        ...prevState,
        month: newMonth, year: newYear,
        financials: newFinancials,
        financialHistory: newHistory,
        employees: updatedEmployees,
        clients: updatedClients,
        reputation: newReputation,
        arAging: newAR,
        receivables: newReceivables,
        lineOfCredit: newLOC,
        vendors: updatedVendors,
        partnerEconomics: newPartnerEconomics,
        budget: recordedBudget,
      };

      const newAlerts = deps.generateAlerts(nextState);
      const newInboxMessages = deps.generateInboxMessages(nextState);

      return {
        ...nextState,
        alerts: [...newAlerts, ...prevState.alerts].slice(0, 10),
        inbox: [...newInboxMessages, ...prevState.inbox].slice(0, 20),
      };
};


export interface ChoiceDeps { random: () => number; generateId: () => string }

export const applyInboxChoice = (state: SimulationState, messageId: string, choiceId: string, deps: ChoiceDeps): SimulationState => {
  const message = state.inbox.find(item => item.id === messageId);
  if (!message || !message.requiresAction || !message.choices.some(choice => choice.id === choiceId)) return state;

  let next: SimulationState = { ...state };
  let manualCollections = 0;
  let resolutionSummary = 'Decision recorded.';
  const scenario = message.scenario;
  const staleQuote =
    (scenario.kind === 'lease-renewal' && state.operatingCosts.rent !== scenario.currentRent) ||
    (scenario.kind === 'it-vendor' && scenario.quotedMonthlyCost !== undefined &&
      state.vendors.some(vendor => vendor.id === scenario.vendorId && vendor.monthlyCost !== scenario.quotedMonthlyCost));
  const staleBudgetPeriod = scenario.kind === 'budget-overrun' &&
    ((scenario.quarter !== undefined && scenario.quarter !== getCurrentQuarter(state.month)) ||
      (scenario.year !== undefined && scenario.year !== state.year));
  const subjectUnavailable =
    (scenario.kind === 'raise-request' && !state.employees.some(employee => employee.id === scenario.employeeId)) ||
    (scenario.kind === 'client-feedback' && !state.clients.some(client => client.id === scenario.clientId)) ||
    (scenario.kind === 'it-vendor' && !state.vendors.some(vendor => vendor.id === scenario.vendorId)) ||
    (scenario.kind === 'collections-problem' && !!scenario.clientId && !state.receivables.some(account =>
      account.clientId === scenario.clientId && account.aging.sixtyDay > 0)) ||
    (scenario.kind === 'budget-overrun' && !state.budget.some(item => item.category === scenario.category && item.quarter === getCurrentQuarter(state.month) && item.year === state.year));
  if (subjectUnavailable || staleQuote || staleBudgetPeriod) {
    const summary = subjectUnavailable
      ? 'The subject is no longer available. The request closed without changes.'
      : staleQuote
        ? 'The quoted monthly cost changed. The request closed without changes.'
        : 'The budget quarter has passed. The request closed without changes.';
    return {
      ...state,
      inbox: state.inbox.map(item => item.id === messageId
        ? { ...item, read: true, requiresAction: false, resolution: { choiceId, summary } }
        : item),
    };
  }
  switch (scenario.kind) {
    case 'raise-request': {
      next.employees = state.employees.map(employee => {
        if (employee.id !== scenario.employeeId) return employee;
        if (choiceId === 'approve') return { ...employee, salary: Math.round(employee.salary * 1.15), efficacy: Math.min(100, employee.efficacy + 5) };
        if (choiceId === 'counter') return { ...employee, salary: Math.round(employee.salary * 1.08), efficacy: Math.min(100, employee.efficacy + 2) };
        if (choiceId === 'deny') return { ...employee, efficacy: Math.max(0, employee.efficacy - 10), burnout: Math.min(100, employee.burnout + 15) };
        return employee;
      });
      const employee = next.employees.find(item => item.id === scenario.employeeId)!;
      resolutionSummary = `${employee.name}'s monthly salary is $${employee.salary.toLocaleString()}, efficacy ${employee.efficacy}%, and burnout ${employee.burnout}%.`;
      break;
    }
    case 'client-feedback': {
      const change = choiceId === 'address' ? 15 : choiceId === 'assign' ? 8 : choiceId === 'ignore' ? -10 : 0;
      next.clients = state.clients.map(client => client.id === scenario.clientId
        ? { ...client, satisfaction: Math.max(0, Math.min(100, client.satisfaction + change)) }
        : client);
      const client = next.clients.find(item => item.id === scenario.clientId)!;
      resolutionSummary = `${client.name}'s satisfaction is now ${client.satisfaction}%.`;
      break;
    }
    case 'new-client': {
      const won = choiceId === 'pursue' ? deps.random() > 0.3 : choiceId === 'initial-contact' ? deps.random() > 0.5 : false;
      if (won) {
        const profiles: Client['paymentProfile'][] = ['prompt', 'normal', 'slow'];
        next.clients = [...state.clients, {
          id: deps.generateId(), name: scenario.name, type: scenario.clientType, feeStructure: 'Retainer',
          monthlyFee: scenario.monthlyFee, satisfaction: 80, contractMonthsRemaining: 12,
          paymentProfile: profiles[Math.floor(deps.random() * profiles.length)], lastPaymentMonth: state.month,
        }];
      }
      resolutionSummary = choiceId === 'pass'
        ? `Passed on the ${scenario.name} opportunity.`
        : won
          ? `${scenario.name} joined as a client at $${scenario.monthlyFee.toLocaleString()}/month.`
          : `${scenario.name} did not sign a contract.`;
      break;
    }
    case 'lease-renewal': {
      if (choiceId === 'accept-rent') next.operatingCosts = { ...state.operatingCosts, rent: Math.round(state.operatingCosts.rent * 1.08) };
      if (choiceId === 'negotiate-rent') next.operatingCosts = { ...state.operatingCosts, rent: Math.round(state.operatingCosts.rent * (deps.random() > 0.5 ? 1.04 : 1.08)) };
      if (choiceId === 'downgrade-rent') {
        next.operatingCosts = { ...state.operatingCosts, rent: Math.max(0, state.operatingCosts.rent - 3000) };
        next.reputation = Math.max(0, state.reputation - 5);
      }
      resolutionSummary = `${choiceId === 'negotiate-rent' && next.operatingCosts.rent < Math.round(state.operatingCosts.rent * 1.08) ? 'Negotiation succeeded. ' : ''}Monthly rent is now $${next.operatingCosts.rent.toLocaleString()}; reputation is ${next.reputation}%.`;
      break;
    }
    case 'it-vendor': {
      const agreed = choiceId === 'switch-vendor' || (choiceId === 'negotiate-vendor' && deps.random() > 0.5);
      if (agreed) {
        const multiplier = choiceId === 'switch-vendor' ? 0.8 : 0.9;
        next.vendors = state.vendors.map(vendor => vendor.id === scenario.vendorId
          ? { ...vendor, name: choiceId === 'switch-vendor' ? 'TechForward Solutions' : vendor.name,
              monthlyCost: Math.round(vendor.monthlyCost * multiplier), contractMonths: choiceId === 'switch-vendor' ? 12 : vendor.contractMonths }
          : vendor);
      }
      const vendor = next.vendors.find(item => item.id === scenario.vendorId)!;
      resolutionSummary = choiceId === 'negotiate-vendor' && !agreed
        ? `${vendor.name} declined the discount; monthly cost remains $${vendor.monthlyCost.toLocaleString()}.`
        : `${vendor.name}'s monthly cost is now $${vendor.monthlyCost.toLocaleString()}.`;
      break;
    }
    case 'benefits-increase': {
      if (choiceId === 'absorb-benefits') next.operatingCosts = { ...state.operatingCosts, misc: state.operatingCosts.misc + scenario.monthlyIncrease };
      if (choiceId === 'pass-benefits') next.employees = state.employees.map(employee => ({ ...employee, burnout: Math.min(100, employee.burnout + 10) }));
      if (choiceId === 'cheaper-plan') next.employees = state.employees.map(employee => ({ ...employee, efficacy: Math.max(0, employee.efficacy - 3) }));
      resolutionSummary = choiceId === 'absorb-benefits'
        ? `Miscellaneous monthly operating costs are now $${next.operatingCosts.misc.toLocaleString()}.`
        : choiceId === 'pass-benefits'
          ? 'Employees absorbed the increase; their burnout rose by up to 10 points.'
          : 'The cheaper plan kept monthly costs flat; employee efficacy fell by up to 3 points.';
      break;
    }
    case 'partner-distribution': {
      const pool = Math.min(state.partnerEconomics.distributionPool, scenario.availablePool);
      const paid = choiceId === 'full-distribution' ? pool : choiceId === 'partial-distribution' ? Math.round(pool / 2) : 0;
      if (paid > 0) {
        next.financials = { ...state.financials, cashOnHand: state.financials.cashOnHand - paid };
        next.partnerEconomics = { ...state.partnerEconomics, distributionPool: state.partnerEconomics.distributionPool - paid,
          totalDistributed: state.partnerEconomics.totalDistributed + paid,
          lastDistributionMonth: state.month, lastDistributionYear: state.year };
      }
      resolutionSummary = paid > 0
        ? `Distributed $${paid.toLocaleString()}; $${next.partnerEconomics.distributionPool.toLocaleString()} remains in the pool.`
        : `Distribution deferred; $${next.partnerEconomics.distributionPool.toLocaleString()} remains in the pool.`;
      break;
    }
    case 'collections-problem': {
      const available = scenario.clientId
        ? state.receivables.find(account => account.clientId === scenario.clientId)?.aging.sixtyDay ?? 0
        : state.arAging.sixtyDay;
      const overdue = Math.min(available, scenario.overdueAmount);
      if (choiceId === 'demand-letter' || choiceId === 'personal-call') {
        manualCollections = collectAtRate(overdue, choiceId === 'demand-letter' ? 0.6 : 0.4);
        let remaining = manualCollections;
        next.receivables = state.receivables.map(account => {
          if (remaining <= 0 || (scenario.clientId && account.clientId !== scenario.clientId)) return account;
          const collected = Math.min(remaining, account.aging.sixtyDay);
          remaining -= collected;
          return collected > 0
            ? { ...account, aging: { ...account.aging, sixtyDay: account.aging.sixtyDay - collected } }
            : account;
        });
        next.arAging = sumReceivables(next.receivables);
        next.financials = { ...state.financials, cashOnHand: state.financials.cashOnHand + manualCollections };
        if (choiceId === 'demand-letter' && scenario.clientId) next.clients = state.clients.map(client =>
          client.id === scenario.clientId ? { ...client, satisfaction: Math.max(0, client.satisfaction - 5) } : client);
        resolutionSummary = `Collected $${manualCollections.toLocaleString()} from 61–90 day receivables${scenario.clientId ? ` for ${state.receivables.find(account => account.clientId === scenario.clientId)?.clientName}` : ''}.`;
      } else if (choiceId === 'write-off-ar') {
        next = writeOffReceivables(next, overdue, 'sixtyDay', scenario.clientId);
        resolutionSummary = `Wrote off $${(state.arAging.sixtyDay - next.arAging.sixtyDay).toLocaleString()} in 61–90 day receivables as bad debt.`;
      }
      break;
    }
    case 'budget-overrun': {
      if (choiceId === 'cut-elsewhere') next.operatingCosts = { ...state.operatingCosts, misc: Math.round(state.operatingCosts.misc * 0.8) };
      if (choiceId === 'reallocate') next.budget = reallocateBudget(state.budget, scenario.category, getCurrentQuarter(state.month), state.year);
      if (choiceId === 'cut-elsewhere') resolutionSummary = `Miscellaneous monthly operating costs are now $${next.operatingCosts.misc.toLocaleString()}.`;
      else if (choiceId === 'reallocate') {
        const previous = state.budget.find(item => item.category === scenario.category && item.quarter === getCurrentQuarter(state.month) && item.year === state.year)!;
        const updated = next.budget.find(item => item.category === scenario.category && item.quarter === getCurrentQuarter(state.month) && item.year === state.year)!;
        resolutionSummary = `Reallocated $${(updated.plannedQuarterly - previous.plannedQuarterly).toLocaleString()} to the ${scenario.category} budget.`;
      } else resolutionSummary = `Accepted the ${scenario.category} budget overrun without changing the plan.`;
      break;
    }
    case 'equipment-failure': {
      if (choiceId === 'buy-equipment' || choiceId === 'temp-fix') next.financials = { ...state.financials, cashOnHand: state.financials.cashOnHand - (choiceId === 'buy-equipment' ? 8000 : 1000) };
      if (choiceId === 'lease-equipment') next.vendors = [...state.vendors, { id: deps.generateId(), name: 'Equipment Lease', category: 'Other', monthlyCost: 300, contractMonths: 36 }];
      resolutionSummary = choiceId === 'lease-equipment'
        ? 'Added an equipment lease costing $300 per month.'
        : `Paid $${(state.financials.cashOnHand - next.financials.cashOnHand).toLocaleString()} for ${choiceId === 'buy-equipment' ? 'new equipment' : 'a temporary repair'}.`;
      break;
    }
    case 'tax-planning': {
      if (choiceId === 'pay-taxes' || choiceId === 'accelerate-expenses') {
        const paid = choiceId === 'pay-taxes' ? scenario.estimatedTax : Math.round(scenario.estimatedTax * 0.6);
        next.financials = { ...state.financials, cashOnHand: state.financials.cashOnHand - paid };
        resolutionSummary = `Paid $${paid.toLocaleString()} in estimated taxes; cash is now $${next.financials.cashOnHand.toLocaleString()}.`;
      }
      else resolutionSummary = 'Deferred the estimated tax payment; cash did not change.';
      break;
    }
    case 'industry-update': {
      resolutionSummary = 'Industry update acknowledged.';
      break;
    }
  }

  next = recordCurrentCash(next, next.financials.cashOnHand, manualCollections);
  next.inbox = state.inbox.map(item => item.id === messageId
    ? { ...item, read: true, requiresAction: false, resolution: { choiceId, summary: resolutionSummary } }
    : item);
  return next;
};
