import type { Client, InboxMessage, InboxScenario, SimulationState } from '@/types/simulation';
import { BENEFITS_RATE } from '@/types/simulation';
import { getOverdueClientAccount } from './engine';

export interface ScenarioDeps {
  random: () => number;
  generateId: () => string;
  now: () => Date;
}

const getCurrentQuarter = (month: number): number => Math.ceil(month / 3);

const prospectNames = [
  'InnovateTech', 'EnergyCorp', 'PharmaLife', 'AutoDrive', 'FinServe', 'CivicGrid',
  'HealthBridge', 'TransitWorks', 'PolicyLabs', 'HarborTrade', 'GreenPath', 'DataForward',
];

// Keep the scenario rules independent of React so choices can be generated reproducibly in tests.
export const generateInboxMessages = (currentState: SimulationState, deps: ScenarioDeps): InboxMessage[] => {
  const messages: InboxMessage[] = [];
  const pending = currentState.inbox.filter(message => message.requiresAction);
  const hasPending = (kind: InboxScenario['kind'], matches: (scenario: InboxScenario) => boolean = () => true): boolean =>
    pending.some(message => message.scenario.kind === kind && matches(message.scenario));

  // Employee raise request
  const employeesWithoutRequests = currentState.employees.filter(employee =>
    !hasPending('raise-request', scenario => scenario.kind === 'raise-request' && scenario.employeeId === employee.id));
  if (deps.random() > 0.75 && employeesWithoutRequests.length > 0) {
    const emp = employeesWithoutRequests[Math.floor(deps.random() * employeesWithoutRequests.length)];
    messages.push({
      id: deps.generateId(), type: 'request', title: 'Raise Request',
      description: `${emp.name} is requesting a salary increase. They cite market conditions and their contributions to recent client wins. Current salary: $${emp.salary.toLocaleString()}/mo.`,
      urgency: 'medium', requiresAction: true, read: false,
      choices: [
        { id: 'approve', label: 'Approve (+15%)', effect: 'Salary +15%; efficacy +5' },
        { id: 'deny', label: 'Deny Request', effect: 'Efficacy -10; burnout +15' },
        { id: 'counter', label: 'Counter Offer (+8%)', effect: 'Salary +8%; efficacy +2' },
      ],
      scenario: { kind: 'raise-request', employeeId: emp.id },
      timestamp: deps.now(),
    });
  }

  // Client complaint
  const lowSatisfactionClients = currentState.clients.filter(client => client.satisfaction < 75 &&
    !hasPending('client-feedback', scenario => scenario.kind === 'client-feedback' && scenario.clientId === client.id));
  if (lowSatisfactionClients.length > 0 && deps.random() > 0.6) {
    const client = lowSatisfactionClients[Math.floor(deps.random() * lowSatisfactionClients.length)];
    messages.push({
      id: deps.generateId(), type: 'alert', title: 'Client Feedback',
      description: `${client.name} has submitted negative feedback about our services. They mention slow response times and lack of visibility on legislative updates.`,
      urgency: 'high', requiresAction: true, read: false,
      choices: [
        { id: 'address', label: 'Schedule Meeting', effect: 'Client satisfaction +15' },
        { id: 'assign', label: 'Add Service Check-ins', effect: 'Client satisfaction +8' },
        { id: 'ignore', label: 'Defer for Now', effect: 'Client satisfaction -10' },
      ],
      scenario: { kind: 'client-feedback', clientId: client.id },
      timestamp: deps.now(),
    });
  }

  // New business opportunity
  if (deps.random() > 0.75) {
    const unavailableNames = new Set([
      ...currentState.clients.map(client => client.name.toLowerCase()),
      ...pending.flatMap(message => message.scenario.kind === 'new-client'
        ? [message.scenario.name.toLowerCase()]
        : []),
    ]);
    const companyNames = prospectNames.filter(name => !unavailableNames.has(name.toLowerCase()));
    if (companyNames.length > 0) {
      const types: Client['type'][] = ['Corporation', 'Trade Association', 'Non-Profit'];
      const name = companyNames[Math.floor(deps.random() * companyNames.length)];
      const type = types[Math.floor(deps.random() * types.length)];
      messages.push({
        id: deps.generateId(), type: 'opportunity', title: 'New Client Interest',
        description: `${name} (${type}) has expressed interest in our government relations services. They have a monthly budget of $12,000-$18,000.`,
        urgency: 'medium', requiresAction: true, read: false,
        choices: [
          { id: 'pursue', label: 'Pursue Aggressively', effect: '70% chance of signing the client' },
          { id: 'initial-contact', label: 'Initial Contact', effect: '50% chance of signing the client' },
          { id: 'pass', label: 'Pass on Opportunity', effect: 'No effect' },
        ],
        scenario: { kind: 'new-client', name, clientType: type, monthlyFee: 15000 },
        timestamp: deps.now(),
      });
    }
  }

  // ---- BACK-OFFICE SCENARIOS ----

  // Rent renewal (every 12 months or so)
  if (currentState.month % 12 === 0 && deps.random() > 0.3 && !hasPending('lease-renewal')) {
    const currentRent = currentState.operatingCosts.rent;
    const increase = Math.round(currentRent * 0.08);
    messages.push({
      id: deps.generateId(), type: 'request', title: 'Lease Renewal Notice',
      description: `Your office lease is up for renewal. The landlord is proposing an 8% increase from $${currentRent.toLocaleString()} to $${(currentRent + increase).toLocaleString()}/month. Current market rates for comparable K Street office space range from $${Math.round(currentRent * 0.85).toLocaleString()} to $${Math.round(currentRent * 1.12).toLocaleString()}.`,
      urgency: 'high', requiresAction: true, read: false,
      choices: [
        { id: 'accept-rent', label: 'Accept Increase', effect: `Rent increases to $${(currentRent + increase).toLocaleString()}/mo` },
        { id: 'negotiate-rent', label: 'Negotiate (50% chance of 4%)', effect: 'May reduce increase to 4%' },
        { id: 'downgrade-rent', label: 'Move to Cheaper Space', effect: 'Save $3,000/mo but lose 5 reputation' },
      ],
      scenario: { kind: 'lease-renewal', currentRent },
      timestamp: deps.now(),
    });
  }

  // IT vendor pitch
  if (deps.random() > 0.9) {
    const itVendor = currentState.vendors.find(vendor => vendor.category === 'IT' &&
      vendor.name !== 'TechForward Solutions' &&
      !hasPending('it-vendor', scenario => scenario.kind === 'it-vendor' && scenario.vendorId === vendor.id));
    if (itVendor) {
      const savings = Math.round(itVendor.monthlyCost * 0.2);
      messages.push({
        id: deps.generateId(), type: 'opportunity', title: 'IT Vendor Pitch',
        description: `A new IT services provider, TechForward Solutions, is offering managed IT services at $${(itVendor.monthlyCost - savings).toLocaleString()}/mo — 20% less than your current vendor (${itVendor.name}, $${itVendor.monthlyCost.toLocaleString()}/mo). They promise faster response times but are a newer company.`,
        urgency: 'low', requiresAction: true, read: false,
        choices: [
          { id: 'switch-vendor', label: 'Switch to New Vendor', effect: `Reduce the monthly fee by about $${savings.toLocaleString()}` },
          { id: 'keep-vendor', label: 'Stay with Current', effect: 'No change, continued reliability' },
          { id: 'negotiate-vendor', label: 'Negotiate with Current', effect: '50% chance of 10% discount' },
        ],
        scenario: { kind: 'it-vendor', vendorId: itVendor.id, quotedMonthlyCost: itVendor.monthlyCost },
        timestamp: deps.now(),
      });
    }
  }

  // Benefits cost increase (annual)
  if (currentState.month === 1 && deps.random() > 0.4 && !hasPending('benefits-increase')) {
    const totalBenefitsCost = currentState.employees.reduce((sum, e) => sum + Math.round(e.salary * BENEFITS_RATE), 0);
    const increase = Math.round(totalBenefitsCost * 0.12);
    messages.push({
      id: deps.generateId(), type: 'alert', title: 'Health Insurance Premium Increase',
      description: `Your health insurance broker notified you that premiums are increasing 12% at renewal. This adds approximately $${increase.toLocaleString()}/mo to your benefits costs across all ${currentState.employees.length} employees.`,
      urgency: 'high', requiresAction: true, read: false,
      choices: [
        { id: 'absorb-benefits', label: 'Absorb the Cost', effect: `Operating costs increase by ~$${increase.toLocaleString()}/mo` },
        { id: 'pass-benefits', label: 'Pass to Employees', effect: 'No cost increase but burnout +10 across all staff' },
        { id: 'cheaper-plan', label: 'Switch to Cheaper Plan', effect: 'Costs stay flat; efficacy -3 across staff' },
      ],
      scenario: { kind: 'benefits-increase', monthlyIncrease: increase },
      timestamp: deps.now(),
    });
  }

  // Partner distribution (quarterly)
  if (currentState.month % 3 === 0 && currentState.partnerEconomics.distributionPool > 10000 &&
    !hasPending('partner-distribution')) {
    const pool = currentState.partnerEconomics.distributionPool;
    messages.push({
      id: deps.generateId(), type: 'request', title: 'Quarterly Partner Distribution',
      description: `The distribution pool has accumulated $${Math.round(pool).toLocaleString()}. As managing partner, you need to decide on the quarterly distribution. Your current cash position is $${currentState.financials.cashOnHand.toLocaleString()}.`,
      urgency: 'medium', requiresAction: true, read: false,
      choices: [
        { id: 'full-distribution', label: `Distribute Full ($${Math.round(pool).toLocaleString()})`, effect: 'Reduces cash by the amount paid; reduces the distribution pool' },
        { id: 'partial-distribution', label: `Distribute Half ($${Math.round(pool / 2).toLocaleString()})`, effect: 'Reduces cash and pool by half the available amount' },
        { id: 'defer-distribution', label: 'Defer to Next Quarter', effect: 'Cash stays unchanged; pool carries forward' },
      ],
      scenario: { kind: 'partner-distribution', availablePool: pool },
      timestamp: deps.now(),
    });
  }

  // Collections problem
  const overdueClient = getOverdueClientAccount({
    ...currentState,
    receivables: currentState.receivables.filter(account =>
      !hasPending('collections-problem', scenario => scenario.kind === 'collections-problem' &&
        scenario.clientId === account.clientId)),
  });
  if (overdueClient && overdueClient.aging.sixtyDay > 5000 && deps.random() > 0.6) {
    const overdueAmount = overdueClient.aging.sixtyDay;
    messages.push({
      id: deps.generateId(), type: 'alert', title: 'Collections Problem',
      description: `${overdueClient.clientName} has $${overdueAmount.toLocaleString()} in invoices that are 61–90 days outstanding. Total 61+ day AR across all accounts: $${Math.round(currentState.arAging.sixtyDay + currentState.arAging.ninetyPlus).toLocaleString()}.`,
      urgency: 'high', requiresAction: true, read: false,
      choices: [
        { id: 'demand-letter', label: 'Send Formal Demand', effect: 'Collect 60% now; client satisfaction -5' },
        { id: 'personal-call', label: 'Personal Call from Partner', effect: 'Collect 40% now; satisfaction unchanged' },
        { id: 'write-off-ar', label: 'Write Off Balance', effect: 'Remove this balance from AR as bad debt expense' },
      ],
      scenario: { kind: 'collections-problem', clientId: overdueClient.clientId ?? undefined, overdueAmount },
      timestamp: deps.now(),
    });
  }

  // Budget overrun
  const quarter = getCurrentQuarter(currentState.month);
  const overBudgetItems = currentState.budget.filter(b =>
    b.quarter === quarter && b.year === currentState.year && b.actualQuarterlySpend > b.plannedQuarterly * 1.15 &&
    !hasPending('budget-overrun', scenario => scenario.kind === 'budget-overrun' &&
      scenario.category === b.category && scenario.quarter === quarter && scenario.year === currentState.year)
  );
  if (overBudgetItems.length > 0 && deps.random() > 0.65) {
    const item = overBudgetItems[0];
    const overrun = Math.round(item.actualQuarterlySpend - item.plannedQuarterly);
    messages.push({
      id: deps.generateId(), type: 'alert', title: 'Budget Overrun Alert',
      description: `${item.category} spending has exceeded the quarterly budget by $${overrun.toLocaleString()} (${item.plannedQuarterly > 0 ? `${Math.round(overrun / item.plannedQuarterly * 100)}% over` : 'unbudgeted spend'}). Planned: $${item.plannedQuarterly.toLocaleString()}, Actual: $${Math.round(item.actualQuarterlySpend).toLocaleString()}.`,
      urgency: 'medium', requiresAction: true, read: false,
      choices: [
        { id: 'cut-elsewhere', label: 'Cut Misc Spending', effect: 'Reduces monthly misc spending by 20% until changed' },
        { id: 'accept-overrun', label: 'Accept Overrun', effect: 'No action, budget stays exceeded' },
        { id: 'reallocate', label: 'Reallocate Budget', effect: 'Moves funds from underspent categories' },
      ],
      scenario: { kind: 'budget-overrun', category: item.category, quarter, year: currentState.year },
      timestamp: deps.now(),
    });
  }

  // Office equipment failure
  if (deps.random() > 0.93 && !hasPending('equipment-failure')) {
    const equipment = ['network server', 'multifunction copier', 'phone system', 'HVAC unit'][Math.floor(deps.random() * 4)];
    messages.push({
      id: deps.generateId(), type: 'alert', title: 'Office Equipment Failure',
      description: `The office ${equipment} has failed and needs replacement. This is affecting daily operations. Choose between immediate cash costs and a monthly lease.`,
      urgency: 'high', requiresAction: true, read: false,
      choices: [
        { id: 'buy-equipment', label: 'Buy New ($8,000)', effect: 'Cash decreases by $8,000' },
        { id: 'lease-equipment', label: 'Lease ($300/mo)', effect: 'Adds a $300 monthly vendor cost' },
        { id: 'temp-fix', label: 'Temporary Fix ($1,000)', effect: 'Cash decreases by $1,000' },
      ],
      scenario: { kind: 'equipment-failure' },
      timestamp: deps.now(),
    });
  }

  // Tax planning is offered every quarter-end when the firm has an outstanding balance.
  if (currentState.month % 3 === 0 && !hasPending('tax-planning')) {
    const estimatedTax = currentState.taxPosition.principalDue + currentState.taxPosition.penaltiesDue;
    if (estimatedTax > 0) {
      messages.push({
        id: deps.generateId(), type: 'request', title: 'Quarterly Tax Planning',
        description: `The firm owes $${estimatedTax.toLocaleString()} in estimated taxes and late charges: $${currentState.taxPosition.principalDue.toLocaleString()} in tax and $${currentState.taxPosition.penaltiesDue.toLocaleString()} in penalties. Choose how much to pay now.`,
        urgency: 'medium', requiresAction: true, read: false,
        choices: [
          { id: 'pay-taxes', label: `Pay Full Balance ($${estimatedTax.toLocaleString()})`, effect: 'Cash decreases by the full outstanding amount' },
          { id: 'defer-taxes', label: 'Pay Nothing Now', effect: 'Cash stays unchanged; unpaid tax can accrue penalties' },
          { id: 'accelerate-expenses', label: 'Pay 60% Now', effect: 'Cash decreases by 60% of the outstanding amount' },
        ],
        scenario: { kind: 'tax-planning', estimatedTax },
        timestamp: deps.now(),
      });
    }
  }

  // Ensure at least one message
  if (messages.length < 1) {
    const updates = [
      'Congress is considering new regulations that may affect your clients in the tech sector.',
      'A key committee hearing on healthcare policy is scheduled for next month.',
      'Budget negotiations may impact government contracting opportunities.',
      'New lobbying disclosure requirements are being discussed.',
    ];
    messages.push({
      id: deps.generateId(), type: 'alert', title: 'Industry Update',
      description: updates[Math.floor(deps.random() * updates.length)],
      urgency: 'low', requiresAction: false, read: false, choices: [], scenario: { kind: 'industry-update' }, timestamp: deps.now(),
    });
  }

  return messages;
};
