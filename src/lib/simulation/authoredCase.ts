import type { InboxMessage, SimulationState } from '@/types/simulation';
import { createInitialSimulationState } from './initialState';
import { getCaseProspectChoices, getCollectionsChoices, getComplaintChoices } from './inboxChoices';

export const CASE_EVENT_IDS = {
  collection: 'case-2026-01-collection',
  intakeReview: 'case-2026-02-intake-review',
  prospect: 'case-2026-02-prospect',
  policy: 'case-2026-03-policy-delay',
  complaint: 'case-2026-03-other-client-complaint',
} as const;

export const CASE_ANCHOR_ID = 'client1';
export const CASE_COMPLAINT_CLIENT_ID = 'client2';
export const CASE_PROSPECT = {
  name: 'Community Energy Council',
  clientType: 'Non-Profit' as const,
  monthlyFee: 12000,
  originalFee: 18000,
};

// Noon UTC keeps the authored calendar date on the same day in US time zones.
const caseTimestamp = (month: number): Date => new Date(Date.UTC(2026, month - 1, 1, 12));

const collectionMessage = (): InboxMessage => ({
  id: CASE_EVENT_IDS.collection,
  type: 'alert',
  title: 'Case · January: TechTrade payment',
  description: 'TechTrade Association has $18,000 billed 61–90 days ago. The firm reports a profit, but those invoices have not turned into cash. Choose a formal demand, a personal call, a write-off that closes collection efforts, or explicitly hold. Routine manual collection remains available in Finances.',
  urgency: 'high', requiresAction: true, read: false,
  choices: [...getCollectionsChoices(), {
    id: 'hold-collection', label: 'Hold collection decision',
    effect: 'Record that the firm did not collect or write off this balance now. Automatic collections and aging still apply when the month advances.',
  }],
  timestamp: caseTimestamp(1),
  scenario: { kind: 'collections-problem', clientId: CASE_ANCHOR_ID, overdueAmount: 18000 },
});

export const createCaseIntakeReviewMessage = (): InboxMessage => ({
  id: CASE_EVENT_IDS.intakeReview,
  type: 'request',
  title: 'Case · February: review the proposed mandate',
  description: `Community Energy Council offers $${CASE_PROSPECT.originalFee.toLocaleString()}/month to advocate for a permitting moratorium on the same data-center issue where TechTrade Association is committed to a faster approval path. Review the conflict and current service commitments before any pursuit. Ordinary intake review uses no partner-intervention slot.`,
  urgency: 'high', requiresAction: true, read: false,
  choices: [{ id: 'review', label: 'Complete intake review',
    effect: 'The original opposing advocacy mandate cannot proceed. Review a separate, limited public-monitoring assignment; no cash, client, or partner-intervention change.' }],
  timestamp: caseTimestamp(2),
  scenario: { kind: 'case-intake-review' },
});

export const createCaseProspectMessage = (): InboxMessage => ({
  id: CASE_EVENT_IDS.prospect,
  type: 'opportunity',
  title: 'Case · February: limited monitoring assignment',
  description: `Intake review found the $${CASE_PROSPECT.originalFee.toLocaleString()}/month opposing advocacy mandate cannot be signed. For this fictional case only, conflict counsel approved a genuinely separate $${CASE_PROSPECT.monthlyFee.toLocaleString()}/month public-calendar monitoring and factual briefing assignment, with no advocacy on the disputed position and no TechTrade confidential information. One signed client uses one service slot. Choose decline, hold for scope clarification, or pursue this expressly reviewed assignment. Approval here is not a general rule that disclosure or consent cures conflicts.`,
  urgency: 'high', requiresAction: true, read: false,
  choices: getCaseProspectChoices(CASE_PROSPECT.monthlyFee),
  timestamp: caseTimestamp(2),
  scenario: { kind: 'case-prospect', name: CASE_PROSPECT.name,
    clientType: CASE_PROSPECT.clientType, monthlyFee: CASE_PROSPECT.monthlyFee },
});

export const createCasePolicyMessage = (): InboxMessage => ({
  id: CASE_EVENT_IDS.policy,
  type: 'alert',
  title: 'Case · March: committee postponement',
  description: 'The firm previously delivered TechTrade a public committee-calendar scan and written issue-status memo. The committee has now postponed consideration of the data-center permitting issue. This external schedule change happens regardless of the prospect decision and does not, by itself, measure current service. Tell TechTrade what was delivered, that the new committee date remains uncertain, and that the next step is to monitor the revised notice and brief options. No response can guarantee enactment.',
  urgency: 'high', requiresAction: true, read: false,
  choices: [
    { id: 'personal', label: 'Lead a recovery meeting', effect: 'Use the shared partner intervention and pay the existing $1,000 meeting expense; satisfaction rises by up to 6. Any overdue collection follows the ordinary meeting rule. The committee schedule does not change.' },
    { id: 'delegate', label: 'Delegate factual update', effect: 'Requires a billable employee. Satisfaction rises by up to 3, with no extra cash expense or partner intervention. The already-paid team supplies the update; capacity and committee timing do not change.' },
    { id: 'defer', label: 'Defer response explicitly', effect: 'Satisfaction falls by up to 10. No cash expense or partner intervention; committee timing does not change.' },
  ],
  timestamp: caseTimestamp(3),
  scenario: { kind: 'case-policy-delay', clientId: CASE_ANCHOR_ID },
});

export const createCaseComplaintMessage = (): InboxMessage => ({
  id: CASE_EVENT_IDS.complaint,
  type: 'alert',
  title: 'Case · March: GlobalCorp service complaint',
  description: 'GlobalCorp Inc. reports slow routine updates on a separate account. Respond personally, delegate to billable staff, or explicitly defer. A personal recovery meeting competes with TechTrade’s policy response for this month’s one major partner intervention.',
  urgency: 'high', requiresAction: true, read: false,
  choices: getComplaintChoices(),
  timestamp: caseTimestamp(3),
  scenario: { kind: 'client-feedback', clientId: CASE_COMPLAINT_CLIENT_ID },
});

// The free-play initializer remains the single source of operating assumptions.
// Only case-specific opening facts and the matching cash/AR snapshots change.
export const createAuthoredCaseSimulationState = (): SimulationState => {
  const base = createInitialSimulationState();
  const cash = 45000;
  const receivables = [...base.receivables, {
    clientId: CASE_ANCHOR_ID,
    clientName: 'TechTrade Association',
    paymentProfile: 'normal' as const,
    aging: { current: 0, thirtyDay: 0, sixtyDay: 18000, ninetyPlus: 0 },
  }];
  return {
    ...base,
    clients: base.clients.map(client => client.id === CASE_ANCHOR_ID
      ? { ...client, contractMonthsRemaining: 3 } : client),
    financials: { ...base.financials, cashOnHand: cash },
    financialHistory: base.financialHistory.map(entry => ({ ...entry, openingCash: cash, cashOnHand: cash })),
    receivables,
    arAging: { current: 15000, thirtyDay: 0, sixtyDay: 18000, ninetyPlus: 0 },
    inbox: [collectionMessage()],
    authoredCase: { status: 'active', renewalOutcome: null },
  };
};

export const getCaseAdvanceBlocker = (state: SimulationState): string | null => {
  if (state.authoredCase?.status !== 'active') return null;
  const required = state.year === 2026 && state.month === 1
    ? [CASE_EVENT_IDS.collection]
    : state.year === 2026 && state.month === 2
      ? [CASE_EVENT_IDS.intakeReview, CASE_EVENT_IDS.prospect]
      : state.year === 2026 && state.month === 3
        ? [CASE_EVENT_IDS.policy, CASE_EVENT_IDS.complaint]
        : [];
  if (required.length === 0) return 'This case is waiting for its scheduled round. Open the Inbox or leave the case to continue freely.';
  const outstanding = required.find(id => !state.inbox.some(message => id === message.id && !message.requiresAction && message.resolution));
  if (!outstanding) return null;
  const label = outstanding === CASE_EVENT_IDS.collection ? 'January collection decision'
    : outstanding === CASE_EVENT_IDS.intakeReview ? 'February intake review'
      : outstanding === CASE_EVENT_IDS.prospect ? 'February prospect decision'
        : outstanding === CASE_EVENT_IDS.policy ? 'March policy response' : 'March GlobalCorp complaint';
  return `Choose the ${label} in the Inbox before advancing. Hold or defer is a valid choice.`;
};

export const leaveAuthoredCase = (state: SimulationState): SimulationState => {
  if (state.authoredCase?.status !== 'active') return state;
  const caseIds = new Set<string>(Object.values(CASE_EVENT_IDS));
  return {
    ...state,
    authoredCase: { ...state.authoredCase, status: 'left' },
    inbox: state.inbox.map(message => caseIds.has(message.id) && message.requiresAction
      ? { ...message, requiresAction: false, read: true,
          resolution: { choiceId: 'held-on-exit', summary: 'Case left; this case-only decision was held without an invented effect.',
            month: state.month, year: state.year } }
      : message),
  };
};
