import { describe, expect, test } from 'bun:test';
import { createInitialSimulationState } from './initialState';
import { advanceSimulationMonth, applyInboxChoice, collectOverdueReceivables, getOverdueClientAccount, isValidAmount, reallocateBudget, recordCashMovement, recordOneTimeOperatingExpense, sumReceivables, writeOffReceivables } from './engine';
import { calculateProfitAndLoss } from './metrics';

const deps = { random: () => 0.6, generateAlerts: () => [], generateInboxMessages: () => [] };
const advance = (state) => advanceSimulationMonth(state, deps);

describe('month advancement and finance', () => {
  test('January starts with one month of recorded actual spend', () => {
    const state = createInitialSimulationState();
    expect(state.budget.find(item => item.category === 'Payroll')?.actualQuarterlySpend).toBe(state.financials.totalPayroll);
    expect(state.budget.find(item => item.category === 'Rent')?.actualQuarterlySpend).toBe(state.operatingCosts.rent);
  });

  test('new quarter records its opening month and carries planned amounts', () => {
    let state = createInitialSimulationState();
    state = advance(advance(advance(state)));
    expect(state.month).toBe(4);
    const q1Payroll = state.budget.find(item => item.category === 'Payroll' && item.quarter === 1);
    const q2Payroll = state.budget.find(item => item.category === 'Payroll' && item.quarter === 2);
    expect(q2Payroll?.plannedQuarterly).toBe(q1Payroll?.plannedQuarterly);
    expect(q2Payroll?.actualQuarterlySpend).toBe(state.financials.totalPayroll);
  });

  test('January rollover records spend in the new year', () => {
    let state = createInitialSimulationState();
    for (let index = 0; index < 12; index += 1) state = advance(state);
    expect([state.month, state.year]).toEqual([1, 2027]);
    expect(state.budget.find(item => item.quarter === 1 && item.year === 2027 && item.category === 'Payroll')?.actualQuarterlySpend).toBe(state.financials.totalPayroll);
  });

  test('automatic bad debt is an expense without a cash outflow', () => {
    const state = createInitialSimulationState();
    state.receivables[0].aging.ninetyPlus = 1000;
    state.arAging = sumReceivables(state.receivables);
    const next = advance(state);
    const entry = next.financialHistory.at(-1);
    expect(entry.arWriteOff).toBeGreaterThan(0);
    expect(entry.expenses).toBe(entry.payroll + entry.operatingCosts + entry.vendorCosts + entry.partnerDraw + entry.locInterest + entry.arWriteOff);
    expect(next.financials.cashOnHand).toBe(state.financials.cashOnHand + entry.collections - (entry.expenses - entry.arWriteOff));
    expect(next.financials.netProfit).toBe(entry.revenue - entry.expenses);
  });

  test('manual write-off changes profit and AR, not cash', () => {
    const state = createInitialSimulationState();
    state.receivables[0].aging.ninetyPlus = 100;
    state.arAging = sumReceivables(state.receivables);
    const next = writeOffReceivables(state, 40);
    expect(next.arAging.ninetyPlus).toBe(60);
    expect(next.financials.cashOnHand).toBe(state.financials.cashOnHand);
    expect(next.financialHistory.at(-1)?.arWriteOff).toBe(40);
    expect(next.financialHistory.at(-1)?.profit).toBe(state.financialHistory.at(-1).profit - 40);
    expect(calculateProfitAndLoss(next.financialHistory.slice(-1)).netIncome).toBe(next.financials.netProfit);
  });

  test('operating margin and historical categories follow booked entries', () => {
    const state = createInitialSimulationState();
    const second = { ...state.financialHistory[0], month: 2, operatingCostBreakdown: { ...state.operatingCosts, rent: 9000 }, operatingCosts: 17000, expenses: state.financialHistory[0].expenses - 3000, profit: state.financialHistory[0].profit + 3000 };
    const ytd = calculateProfitAndLoss([state.financialHistory[0], second]);
    expect(ytd.operatingCosts.rent).toBe(21000);
    expect(ytd.operatingMarginPercent).toBeCloseTo(ytd.operatingIncome / ytd.revenue * 100);
    expect(ytd.netIncome).toBe(state.financialHistory[0].profit + second.profit);
  });
});

describe('cash activity and one-time costs', () => {
  const reconcile = entry =>
    entry.openingCash + entry.collections - entry.recurringCashExpensesPaid +
    entry.cashMovements.reduce((sum, movement) => sum + movement.amount, 0);
  const message = (id, scenario, choiceId) => ({
    id, type: 'request', title: 'Cash choice', description: 'Decision', urgency: 'medium',
    requiresAction: true, read: false, timestamp: new Date(), scenario,
    choices: [{ id: choiceId, label: 'Choose', effect: 'Cash changes' }],
  });
  const choose = (state, scenario, choiceId) => applyInboxChoice(
    { ...state, inbox: [message('cash-choice', scenario, choiceId)] },
    'cash-choice', choiceId, { random: () => 0, generateId: () => 'new' },
  );

  test('seeded January is a cash snapshot despite booked P&L expenses', () => {
    const state = createInitialSimulationState();
    const january = state.financialHistory[0];
    expect(january.isOpeningSnapshot).toBe(true);
    expect(january.openingCash).toBe(250000);
    expect(january.recurringCashExpensesPaid).toBe(0);
    expect(january.expenses).toBeGreaterThan(0);
    expect(reconcile(january)).toBe(january.cashOnHand);

    const afterDraw = recordCashMovement(state, { kind: 'loc-draw', amount: 10000 });
    const afterRepayment = recordCashMovement(afterDraw, { kind: 'loc-repayment', amount: -3000 });
    expect(afterRepayment.financialHistory[0].cashMovements).toEqual([
      { kind: 'loc-draw', amount: 10000 },
      { kind: 'loc-repayment', amount: -3000 },
    ]);
    expect(reconcile(afterRepayment.financialHistory[0])).toBe(afterRepayment.financials.cashOnHand);
    expect(afterRepayment.financials.netProfit).toBe(state.financials.netProfit);
    expect(recordCashMovement(state, { kind: 'loc-draw', amount: -100 })).toBe(state);
    expect(recordCashMovement(state, { kind: 'tax-payment', amount: 0 })).toBe(state);
  });

  test('month close reconciles recurring cash, collections, and automatic LOC financing', () => {
    const initial = createInitialSimulationState();
    const lowCash = {
      ...initial,
      financials: { ...initial.financials, cashOnHand: 1000 },
      financialHistory: [{ ...initial.financialHistory[0], cashOnHand: 1000, openingCash: 1000 }],
    };
    const borrowed = advance(lowCash);
    const february = borrowed.financialHistory.at(-1);
    expect(february.isOpeningSnapshot).toBe(false);
    expect(february.openingCash).toBe(1000);
    expect(february.recurringCashExpensesPaid).toBe(
      february.payroll + february.operatingCosts + february.vendorCosts + february.partnerDraw + february.locInterest,
    );
    expect(february.cashMovements.some(movement => movement.kind === 'loc-draw' && movement.amount > 0)).toBe(true);
    expect(reconcile(february)).toBe(february.cashOnHand);

    const withDebt = { ...initial, lineOfCredit: { ...initial.lineOfCredit, drawn: 10000 } };
    const repaid = advance(withDebt);
    const repaymentMonth = repaid.financialHistory.at(-1);
    expect(repaymentMonth.cashMovements).toEqual([{ kind: 'loc-repayment', amount: -10000 }]);
    expect(reconcile(repaymentMonth)).toBe(repaymentMonth.cashOnHand);
  });

  test('hiring, severance, and repair are cash expenses and operating P&L costs', () => {
    const initial = createInitialSimulationState();
    const hired = recordOneTimeOperatingExpense(initial, 'hiring', 5000);
    const severed = recordOneTimeOperatingExpense(hired, 'severance', 2000);
    const repaired = choose(severed, { kind: 'equipment-failure' }, 'temp-fix');
    const entry = repaired.financialHistory.at(-1);
    expect(entry.cashMovements).toEqual([
      { kind: 'hiring', amount: -5000 },
      { kind: 'severance', amount: -2000 },
      { kind: 'repair', amount: -1000 },
    ]);
    expect(entry.oneTimeOperatingExpenses).toBe(8000);
    expect(entry.expenses).toBe(initial.financialHistory[0].expenses + 8000);
    expect(entry.profit).toBe(initial.financialHistory[0].profit - 8000);
    expect(repaired.financials.netProfit).toBe(entry.profit);
    expect(calculateProfitAndLoss([entry]).oneTimeOperatingExpenses).toBe(8000);
    expect(calculateProfitAndLoss([entry]).netIncome).toBe(entry.profit);
    expect(reconcile(entry)).toBe(entry.cashOnHand);
  });

  test('equipment, tax, and partner distributions affect cash without changing P&L', () => {
    const initial = createInitialSimulationState();
    const equipment = choose(initial, { kind: 'equipment-failure' }, 'buy-equipment');
    const taxed = choose(equipment, { kind: 'tax-planning', estimatedTax: 3000 }, 'pay-taxes');
    const withPool = { ...taxed, partnerEconomics: { ...taxed.partnerEconomics, distributionPool: 10000 } };
    const distributed = choose(withPool, { kind: 'partner-distribution', availablePool: 10000 }, 'partial-distribution');
    const entry = distributed.financialHistory.at(-1);
    expect(entry.cashMovements).toEqual([
      { kind: 'equipment-purchase', amount: -8000 },
      { kind: 'tax-payment', amount: -3000 },
      { kind: 'partner-distribution', amount: -5000 },
    ]);
    expect(entry.profit).toBe(initial.financialHistory[0].profit);
    expect(entry.oneTimeOperatingExpenses).toBe(0);
    expect(distributed.partnerEconomics.distributionPool).toBe(5000);
    expect(reconcile(entry)).toBe(entry.cashOnHand);
    expect(applyInboxChoice(distributed, 'cash-choice', 'partial-distribution', { random: () => 0, generateId: () => 'new' })).toBe(distributed);
  });
});

describe('client receivable accounts', () => {
  const aging = (current = 0, thirtyDay = 0, sixtyDay = 0, ninetyPlus = 0) =>
    ({ current, thirtyDay, sixtyDay, ninetyPlus });
  const account = (clientId, clientName, paymentProfile, buckets) =>
    ({ clientId, clientName, paymentProfile, aging: buckets });
  const withAccounts = (state, receivables) =>
    ({ ...state, receivables, arAging: sumReceivables(receivables) });

  test('ages each account at its own bucket-specific collection rate', () => {
    const state = withAccounts(createInitialSimulationState(), [
      account('client2', 'GlobalCorp Inc.', 'prompt', aging(0, 1000)),
      account('client3', 'EcoNon-Profit', 'slow', aging(0, 1000)),
    ]);
    const next = advance(state);
    expect(next.financials.collectionsThisMonth).toBe(1400); // 90% prompt + 50% slow
    expect(next.receivables.find(item => item.clientId === 'client2').aging.sixtyDay).toBe(100);
    expect(next.receivables.find(item => item.clientId === 'client3').aging.sixtyDay).toBe(500);
    expect(next.arAging).toEqual(sumReceivables(next.receivables));
    expect(next.arAging.current).toBe(next.financials.grossRevenue);
  });

  test('rounding never collects more than a small account balance', () => {
    const state = withAccounts(createInitialSimulationState(), [
      account('client2', 'GlobalCorp Inc.', 'prompt', aging(0.6, 0.6)),
    ]);
    const next = advance(state);
    expect(next.financials.collectionsThisMonth).toBe(1.2);
    expect(next.receivables.find(item => item.clientId === 'client2').aging.thirtyDay).toBe(0);
    expect(next.receivables.find(item => item.clientId === 'client2').aging.sixtyDay).toBe(0);
    expect(Object.values(next.arAging).every(value => value >= 0)).toBe(true);
  });

  test('keeps and collects a departed client balance without adding invoices', () => {
    const initial = createInitialSimulationState();
    const state = withAccounts({ ...initial, clients: initial.clients.filter(client => client.id !== 'client3') }, [
      account('client3', 'EcoNon-Profit', 'slow', aging(1000)),
    ]);
    const next = advance(state);
    const formerClient = next.receivables.find(item => item.clientId === 'client3');
    expect(formerClient).toBeDefined();
    expect(formerClient.aging).toEqual(aging(0, 400));
    expect(next.financials.collectionsThisMonth).toBe(600);
    expect(next.clients.some(client => client.id === 'client3')).toBe(false);
    expect(next.arAging).toEqual(sumReceivables(next.receivables));
  });

  test('named collections and write-off affect only the named account', () => {
    const state = withAccounts(createInitialSimulationState(), [
      account('client2', 'GlobalCorp Inc.', 'prompt', aging(0, 0, 1000)),
      account('client3', 'EcoNon-Profit', 'slow', aging(0, 0, 1000)),
    ]);
    expect(getOverdueClientAccount(state)?.clientId).toBe('client2');
    const message = {
      id: 'collections', type: 'alert', title: 'Collections Problem', description: 'Client overdue', urgency: 'high',
      requiresAction: true, read: false, timestamp: new Date(),
      choices: [{ id: 'demand-letter', label: 'Demand', effect: 'Collect' }, { id: 'write-off-ar', label: 'Write off', effect: 'Expense' }],
      scenario: { kind: 'collections-problem', clientId: 'client3', overdueAmount: 1000 },
    };
    const choiceDeps = { random: () => 0, generateId: () => 'new' };
    const collected = applyInboxChoice({ ...state, inbox: [message] }, 'collections', 'demand-letter', choiceDeps);
    expect(collected.receivables[0].aging.sixtyDay).toBe(1000);
    expect(collected.receivables[1].aging.sixtyDay).toBe(400);
    expect(collected.financials.collectionsThisMonth).toBe(600);
    expect(collected.arAging).toEqual(sumReceivables(collected.receivables));
    expect(collected.inbox[0].resolution.summary).toContain('$600');
    expect(applyInboxChoice(collected, 'collections', 'demand-letter', choiceDeps)).toBe(collected);

    const writtenOff = applyInboxChoice({ ...state, inbox: [message] }, 'collections', 'write-off-ar', choiceDeps);
    expect(writtenOff.receivables[0].aging.sixtyDay).toBe(1000);
    expect(writtenOff.receivables[1].aging.sixtyDay).toBe(0);
    expect(writtenOff.arAging).toEqual(sumReceivables(writtenOff.receivables));
    expect(writtenOff.financialHistory.at(-1).arWriteOff).toBe(1000);
  });

  test('legacy unassigned balance cannot be spent through a named collections message', () => {
    const state = withAccounts(createInitialSimulationState(), [
      account(null, 'Unassigned legacy balance', 'normal', aging(0, 0, 1000)),
    ]);
    const message = {
      id: 'legacy-collections', type: 'alert', title: 'Collections Problem', description: 'Old request', urgency: 'high',
      requiresAction: true, read: false, timestamp: new Date(),
      choices: [{ id: 'demand-letter', label: 'Demand', effect: 'Collect' }],
      scenario: { kind: 'collections-problem', clientId: 'client3', overdueAmount: 1000 },
    };
    const next = applyInboxChoice({ ...state, inbox: [message] }, message.id, 'demand-letter', { random: () => 0, generateId: () => 'new' });
    expect(next.receivables).toBe(state.receivables);
    expect(next.financials.cashOnHand).toBe(state.financials.cashOnHand);
    expect(next.inbox[0].resolution.summary).toContain('no longer available');
  });

  test('manual collections reconcile cash, history, and aggregate accounts', () => {
    const state = withAccounts(createInitialSimulationState(), [
      account('client2', 'GlobalCorp Inc.', 'prompt', aging(0, 1000)),
      account('client3', 'EcoNon-Profit', 'slow', aging(0, 1000)),
    ]);
    const next = collectOverdueReceivables(state);
    expect(next.financials.cashOnHand - state.financials.cashOnHand).toBe(600);
    expect(next.financialHistory.at(-1).collections).toBe(600);
    expect(next.arAging).toEqual(sumReceivables(next.receivables));
    expect(next.receivables.map(item => item.aging.thirtyDay)).toEqual([700, 700]);
  });

  test('overdue selector chooses the largest active client account', () => {
    const initial = createInitialSimulationState();
    const state = withAccounts(initial, [
      account(null, 'Legacy', 'normal', aging(0, 0, 9000)),
      account('former', 'Former Client', 'slow', aging(0, 0, 8000)),
      account('client2', 'GlobalCorp Inc.', 'prompt', aging(0, 0, 1500)),
      account('client3', 'EcoNon-Profit', 'slow', aging(0, 0, 2500)),
    ]);
    expect(getOverdueClientAccount(state)?.clientId).toBe('client3');
  });
});

describe('inbox decisions and amount guards', () => {
  const addMessage = (state, message) => ({ ...state, inbox: [message] });

  test('raise decision affects only the named employee and cannot run twice', () => {
    const state = createInitialSimulationState();
    const message = {
      id: 'raise', type: 'request', title: 'Raise Request', description: 'Employee request', urgency: 'medium',
      requiresAction: true, read: false, choices: [{ id: 'approve', label: 'Approve', effect: 'Increase salary' }],
      timestamp: new Date(), scenario: { kind: 'raise-request', employeeId: state.employees[1].id },
    };
    const first = applyInboxChoice(addMessage(state, message), 'raise', 'approve', { random: () => 0, generateId: () => 'new' });
    expect(first.employees[0].salary).toBe(state.employees[0].salary);
    expect(first.employees[1].salary).toBe(Math.round(state.employees[1].salary * 1.15));
    expect(applyInboxChoice(first, 'raise', 'approve', { random: () => 0, generateId: () => 'new' })).toBe(first);
  });

  test('removed scenario subject closes without changing another employee', () => {
    const state = createInitialSimulationState();
    const message = {
      id: 'raise', type: 'request', title: 'Raise Request', description: 'Employee request', urgency: 'medium',
      requiresAction: true, read: false, choices: [{ id: 'approve', label: 'Approve', effect: 'Increase salary' }],
      timestamp: new Date(), scenario: { kind: 'raise-request', employeeId: 'former-employee' },
    };
    const result = applyInboxChoice(addMessage(state, message), 'raise', 'approve', { random: () => 0, generateId: () => 'new' });
    expect(result.employees).toBe(state.employees);
    expect(result.inbox[0].requiresAction).toBe(false);
    expect(result.inbox[0].resolution.summary).toContain('no longer available');
  });

  test('client feedback targets its subject and opportunity preserves client type', () => {
    const state = createInitialSimulationState();
    const feedback = {
      id: 'feedback', type: 'alert', title: 'Client Feedback', description: 'Complaint', urgency: 'high',
      requiresAction: true, read: false, choices: [{ id: 'address', label: 'Address', effect: 'Improve' }],
      timestamp: new Date(), scenario: { kind: 'client-feedback', clientId: state.clients[1].id },
    };
    const addressed = applyInboxChoice(addMessage(state, feedback), 'feedback', 'address', { random: () => 0, generateId: () => 'new' });
    expect(addressed.clients[0].satisfaction).toBe(state.clients[0].satisfaction);
    expect(addressed.clients[1].satisfaction).toBe(Math.min(100, state.clients[1].satisfaction + 15));
    const opportunity = { ...feedback, id: 'opportunity', choices: [{ id: 'pursue', label: 'Pursue', effect: 'Win' }], scenario: { kind: 'new-client', name: 'New Nonprofit', clientType: 'Non-Profit', monthlyFee: 12000 } };
    const won = applyInboxChoice(addMessage(addressed, opportunity), 'opportunity', 'pursue', { random: () => 0.9, generateId: () => 'won' });
    expect(won.clients.at(-1)).toMatchObject({ name: 'New Nonprofit', type: 'Non-Profit', monthlyFee: 12000 });
    expect(won.inbox[0].resolution.summary).toContain('joined as a client');
    const lost = applyInboxChoice(addMessage(addressed, opportunity), 'opportunity', 'pursue', { random: () => 0, generateId: () => 'lost' });
    expect(lost.clients.length).toBe(addressed.clients.length);
    expect(lost.inbox[0].resolution.summary).toContain('did not sign');
  });

  test('stale rent and vendor quotes close without changing costs', () => {
    const state = createInitialSimulationState();
    const base = {
      type: 'request', title: 'Cost decision', description: 'Old quote', urgency: 'medium',
      requiresAction: true, read: false, timestamp: new Date(),
    };
    const lease = {
      ...base, id: 'lease', choices: [{ id: 'accept-rent', label: 'Accept', effect: 'Rent rises' }],
      scenario: { kind: 'lease-renewal', currentRent: state.operatingCosts.rent - 100 },
    };
    const vendor = {
      ...base, id: 'vendor', choices: [{ id: 'switch-vendor', label: 'Switch', effect: 'Save' }],
      scenario: { kind: 'it-vendor', vendorId: state.vendors[1].id, quotedMonthlyCost: state.vendors[1].monthlyCost - 100 },
    };
    const deps = { random: () => 0, generateId: () => 'new' };
    const afterLease = applyInboxChoice({ ...state, inbox: [lease] }, 'lease', 'accept-rent', deps);
    expect(afterLease.operatingCosts).toBe(state.operatingCosts);
    expect(afterLease.inbox[0].resolution.summary).toContain('quoted monthly cost changed');
    const afterVendor = applyInboxChoice({ ...state, inbox: [vendor] }, 'vendor', 'switch-vendor', deps);
    expect(afterVendor.vendors).toBe(state.vendors);
    expect(afterVendor.inbox[0].resolution.summary).toContain('quoted monthly cost changed');
  });

  test('vendor negotiation reports the actual random outcome', () => {
    const state = createInitialSimulationState();
    const vendor = state.vendors[1];
    const message = {
      id: 'vendor', type: 'opportunity', title: 'IT Vendor Pitch', description: 'Discount', urgency: 'low',
      requiresAction: true, read: false, timestamp: new Date(),
      choices: [{ id: 'negotiate-vendor', label: 'Negotiate', effect: 'Chance' }],
      scenario: { kind: 'it-vendor', vendorId: vendor.id, quotedMonthlyCost: vendor.monthlyCost },
    };
    const failed = applyInboxChoice({ ...state, inbox: [message] }, 'vendor', 'negotiate-vendor', { random: () => 0, generateId: () => 'new' });
    expect(failed.vendors[1].monthlyCost).toBe(vendor.monthlyCost);
    expect(failed.inbox[0].resolution.summary).toContain('declined');
    const succeeded = applyInboxChoice({ ...state, inbox: [message] }, 'vendor', 'negotiate-vendor', { random: () => 1, generateId: () => 'new' });
    expect(succeeded.vendors[1].monthlyCost).toBe(Math.round(vendor.monthlyCost * 0.9));
    expect(succeeded.inbox[0].resolution.summary).toContain('1,350');
  });

  test('an old budget overrun cannot change the next quarter', () => {
    let state = createInitialSimulationState();
    state = advance(advance(advance(state)));
    const message = {
      id: 'q1-budget', type: 'alert', title: 'Budget overrun', description: 'Old quarter', urgency: 'medium',
      requiresAction: true, read: false, timestamp: new Date(),
      choices: [{ id: 'reallocate', label: 'Reallocate', effect: 'Moves plan' }],
      scenario: { kind: 'budget-overrun', category: 'Payroll', quarter: 1, year: 2026 },
    };
    const next = applyInboxChoice({ ...state, inbox: [message] }, message.id, 'reallocate', { random: () => 0, generateId: () => 'new' });
    expect(next.budget).toBe(state.budget);
    expect(next.inbox[0].resolution.summary).toContain('budget quarter has passed');
  });

  test('reallocation transfers budget without changing its total', () => {
    const items = [
      { category: 'Payroll', plannedQuarterly: 300, actualQuarterlySpend: 400, quarter: 1, year: 2026 },
      { category: 'Rent', plannedQuarterly: 200, actualQuarterlySpend: 50, quarter: 1, year: 2026 },
    ];
    const changed = reallocateBudget(items, 'Payroll', 1, 2026);
    expect(changed[0].plannedQuarterly).toBe(400);
    expect(changed[1].plannedQuarterly).toBe(100);
    expect(changed.reduce((sum, item) => sum + item.plannedQuarterly, 0)).toBe(500);
  });

  test('nonfinite, negative, and zero invalid amounts cannot write off AR', () => {
    const state = createInitialSimulationState();
    state.receivables[0].aging.ninetyPlus = 100;
    state.arAging = sumReceivables(state.receivables);
    for (const amount of [NaN, Infinity, -1, 0]) {
      expect(isValidAmount(amount)).toBe(false);
      expect(writeOffReceivables(state, amount)).toBe(state);
    }
  });
});
