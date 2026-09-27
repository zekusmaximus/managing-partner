import { describe, expect, test } from 'bun:test';
import { createInitialSimulationState } from './initialState';
import { generateInboxMessages } from './scenarios';

const fixedTime = new Date('2026-03-31T12:00:00.000Z');
const generate = (state, random = () => 0.99) => {
  let nextId = 0;
  return generateInboxMessages(state, {
    random,
    generateId: () => `message-${++nextId}`,
    now: () => new Date(fixedTime),
  });
};

const pending = (scenario, requiresAction = true) => ({
  id: 'pending', type: 'request', title: 'Pending', description: 'Pending decision', urgency: 'medium',
  requiresAction, read: false, choices: [], scenario, timestamp: fixedTime,
});

describe('scenario generation', () => {
  test('uses injected randomness, IDs, and time with the tuned event odds', () => {
    const state = createInitialSimulationState();
    const first = generate(state);
    const second = generate(state);
    expect(first).toEqual(second);
    expect(first.map(message => message.scenario.kind)).toEqual([
      'raise-request', 'new-client', 'it-vendor', 'benefits-increase', 'equipment-failure',
    ]);
    expect(new Set(first.map(message => message.id)).size).toBe(first.length);
    expect(first.every(message => message.timestamp.getTime() === fixedTime.getTime())).toBe(true);
    expect(first.find(message => message.scenario.kind === 'raise-request').scenario.employeeId)
      .toBe(state.employees.at(-1).id);
  });

  test('does not duplicate a pending subject and allows a resolved subject to recur', () => {
    const state = createInitialSimulationState();
    state.employees = [state.employees[0]];
    state.clients = [{ ...state.clients[0], satisfaction: 50 }];
    state.inbox = [
      pending({ kind: 'raise-request', employeeId: state.employees[0].id }),
      pending({ kind: 'client-feedback', clientId: state.clients[0].id }),
    ];
    const blocked = generate(state);
    expect(blocked.some(message => message.scenario.kind === 'raise-request')).toBe(false);
    expect(blocked.some(message => message.scenario.kind === 'client-feedback')).toBe(false);

    state.inbox = state.inbox.map(message => ({ ...message, requiresAction: false }));
    const availableAgain = generate(state);
    expect(availableAgain.some(message => message.scenario.kind === 'raise-request')).toBe(true);
    expect(availableAgain.some(message => message.scenario.kind === 'client-feedback')).toBe(true);
  });

  test('avoids active and pending prospect names, including case differences', () => {
    const state = createInitialSimulationState();
    state.clients.push({ ...state.clients[0], id: 'already-signed', name: 'innovatetech' });
    state.inbox = [pending({ kind: 'new-client', name: 'EnergyCorp', clientType: 'Corporation', monthlyFee: 15000 })];
    const draws = [0, 0.99, 0, 0]; // no raise, opportunity, first available name, first type
    const messages = generate(state, () => draws.shift() ?? 0);
    const opportunity = messages.find(message => message.scenario.kind === 'new-client');
    expect(opportunity.scenario.name).toBe('PharmaLife');
    expect(opportunity.scenario.monthlyFee).toBe(15000);
  });

  test('skips a prospect offer safely when every fictional name is already in use', () => {
    const state = createInitialSimulationState();
    const names = [
      'InnovateTech', 'EnergyCorp', 'PharmaLife', 'AutoDrive', 'FinServe', 'CivicGrid',
      'HealthBridge', 'TransitWorks', 'PolicyLabs', 'HarborTrade', 'GreenPath', 'DataForward',
    ];
    state.clients.push(...names.map((name, index) => ({
      ...state.clients[0], id: `signed-${index}`, name,
    })));
    expect(generate(state).some(message => message.scenario.kind === 'new-client')).toBe(false);
  });

  test('does not repeat the IT switch offer for TechForward or an unresolved IT decision', () => {
    const state = createInitialSimulationState();
    const vendor = state.vendors.find(item => item.category === 'IT');
    state.inbox = [pending({ kind: 'it-vendor', vendorId: vendor.id, quotedMonthlyCost: vendor.monthlyCost })];
    expect(generate(state).some(message => message.scenario.kind === 'it-vendor')).toBe(false);
    state.inbox = [];
    state.vendors = state.vendors.map(item => item.id === vendor.id
      ? { ...item, name: 'TechForward Solutions' }
      : item);
    expect(generate(state).some(message => message.scenario.kind === 'it-vendor')).toBe(false);
  });

  test('offers a collections decision for a different overdue client when one is pending', () => {
    const state = createInitialSimulationState();
    state.receivables = [
      { clientId: 'client2', clientName: 'GlobalCorp Inc.', paymentProfile: 'prompt',
        aging: { current: 0, thirtyDay: 0, sixtyDay: 9000, ninetyPlus: 0 } },
      { clientId: 'client3', clientName: 'EcoNon-Profit', paymentProfile: 'slow',
        aging: { current: 0, thirtyDay: 0, sixtyDay: 7000, ninetyPlus: 0 } },
    ];
    state.arAging = { current: 0, thirtyDay: 0, sixtyDay: 16000, ninetyPlus: 0 };
    state.inbox = [pending({ kind: 'collections-problem', clientId: 'client2', overdueAmount: 9000 })];
    const collections = generate(state).find(message => message.scenario.kind === 'collections-problem');
    expect(collections.scenario.clientId).toBe('client3');
  });

  test('quotes the outstanding tax and penalty balance every quarter-end, even with low random draws', () => {
    const state = createInitialSimulationState();
    state.month = 3;
    state.taxPosition = { principalDue: 1234, penaltiesDue: 56 };
    const messages = generate(state, () => 0);
    const tax = messages.find(message => message.scenario.kind === 'tax-planning');
    expect(tax.scenario.estimatedTax).toBe(1290);
    expect(tax.description).toContain('$1,234 in tax and $56 in penalties');
    expect(tax.choices.map(choice => choice.id)).toEqual(['pay-taxes', 'defer-taxes', 'accelerate-expenses']);
    expect(messages.some(message => message.scenario.kind === 'industry-update')).toBe(false);

    state.inbox = [pending({ kind: 'tax-planning', estimatedTax: 1290 })];
    expect(generate(state, () => 0).some(message => message.scenario.kind === 'tax-planning')).toBe(false);
    state.inbox = [];
    state.taxPosition = { principalDue: 0, penaltiesDue: 0 };
    expect(generate(state, () => 0).some(message => message.scenario.kind === 'tax-planning')).toBe(false);
  });

  test('deduplicates budget overruns by category and quarter while allowing another category', () => {
    const state = createInitialSimulationState();
    state.month = 3;
    const [payroll, rent] = state.budget;
    state.budget = [
      { ...payroll, actualQuarterlySpend: payroll.plannedQuarterly * 1.3 },
      { ...rent, actualQuarterlySpend: rent.plannedQuarterly * 1.3 },
    ];
    state.inbox = [pending({ kind: 'budget-overrun', category: payroll.category, quarter: 1, year: 2026 })];
    const budget = generate(state).find(message => message.scenario.kind === 'budget-overrun');
    expect(budget.scenario.category).toBe(rent.category);
    expect(budget.scenario.quarter).toBe(1);
  });
});
