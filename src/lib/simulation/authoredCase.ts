import type { CaseGuidance, CaseRound, CaseSnapshot, InboxMessage, SimulationState } from '@/types/simulation';
import { createInitialSimulationState } from './initialState';
import { getCaseProspectChoices, getCollectionsChoices, getComplaintChoices } from './inboxChoices';

export const CASE_EVENT_IDS = {
  collection: 'case-2026-01-collection',
  intakeReview: 'case-2026-02-intake-review',
  prospect: 'case-2026-02-prospect',
  policy: 'case-2026-03-policy-delay',
  complaint: 'case-2026-03-other-client-complaint',
} as const;

export const CASE_LEGACY_PREDICTION = 'legacy-unavailable';

export const CASE_REQUIRED_EVENTS: Record<CaseRound, readonly string[]> = {
  1: [CASE_EVENT_IDS.collection],
  2: [CASE_EVENT_IDS.intakeReview, CASE_EVENT_IDS.prospect],
  3: [CASE_EVENT_IDS.policy, CASE_EVENT_IDS.complaint],
};

export const CASE_ANCHOR_ID = 'client1';
export const CASE_COMPLAINT_CLIENT_ID = 'client2';
export const CASE_PROSPECT = {
  name: 'Community Energy Council',
  clientType: 'Non-Profit' as const,
  monthlyFee: 12000,
  originalFee: 18000,
};

export const CASE_PREDICTIONS: Record<CaseRound, { question: string; options: { id: string; label: string }[] }> = {
  1: { question: 'If TechTrade pays an invoice already billed, what changes immediately?', options: [
    { id: 'cash-ar', label: 'Cash rises and receivables fall; profit stays the same' },
    { id: 'profit', label: 'Profit rises because the payment is new revenue' },
    { id: 'not-sure', label: "I'm not sure" },
  ] },
  2: { question: 'If the reviewed prospect signs, what happens to current service coverage?', options: [
    { id: 'coverage-falls', label: 'It falls unless the team adds capacity' },
    { id: 'fee-only', label: 'The fee arrives without any additional service work' },
    { id: 'not-sure', label: "I'm not sure" },
  ] },
  3: { question: 'Can a stronger client response change the committee’s new date?', options: [
    { id: 'service-not-date', label: 'It may help service and trust, but not the committee date' },
    { id: 'date-moves', label: 'A personal meeting can bring the committee date forward' },
    { id: 'not-sure', label: "I'm not sure" },
  ] },
};

export const CASE_REFLECTIONS: Record<CaseRound, { question: string; options: { id: string; label: string }[] }> = {
  1: { question: 'What best explains the result of the collection choice?', options: [
    { id: 'prior-bill', label: 'Collecting an old bill moves cash and AR, not billed revenue' },
    { id: 'all-income', label: 'Every cash receipt is new profit' },
    { id: 'not-sure', label: "I'm not sure yet" },
  ] },
  2: { question: 'What was the main trade-off in the reviewed prospect decision?', options: [
    { id: 'fee-capacity', label: 'Possible fees came with service demand and a limited mandate' },
    { id: 'fee-only', label: 'A higher fee would have had no obligations' },
    { id: 'not-sure', label: "I'm not sure yet" },
  ] },
  3: { question: 'What can the firm control after the postponement?', options: [
    { id: 'service', label: 'Its update, next steps, and use of partner attention' },
    { id: 'committee', label: 'The committee’s date and the renewal result' },
    { id: 'not-sure', label: "I'm not sure yet" },
  ] },
};

export const CASE_APPLICATION = {
  question: 'A different client pays promptly, but a new mandate would stretch the same team while a public decision is delayed. What would you examine before accepting?',
  options: [
    { id: 'scope-capacity', label: 'Check scope, conflicts, current service capacity, and cash commitments' },
    { id: 'cash-only', label: 'Accept based on prompt payment alone' },
    { id: 'not-sure', label: "I'm not sure yet" },
  ],
};

export const getCaseRound = (state: SimulationState): CaseRound | null =>
  state.authoredCase?.status === 'active' && state.year === 2026 &&
  (state.month === 1 || state.month === 2 || state.month === 3) ? state.month : null;

export const getCaseSnapshot = (state: SimulationState): CaseSnapshot => ({
  cash: state.financials.cashOnHand,
  ar: Object.values(state.arAging).reduce((sum, amount) => sum + amount, 0),
  profit: state.financials.netProfit,
  credit: state.lineOfCredit.drawn,
  clients: state.clients.length,
  staff: state.employees.length,
  anchorSatisfaction: state.clients.find(client => client.id === CASE_ANCHOR_ID)?.satisfaction ?? null,
});

export const createCaseGuidance = (state: SimulationState): CaseGuidance => ({
  paused: false,
  predictions: [null, null, null],
  reflections: [null, null, null],
  roundOpening: getCaseSnapshot(state),
  decisions: [],
  monthly: [],
  application: null,
});

// Slice B saves have actual case choices but no prediction prompts. Mark only
// rounds with a resolved stable-ID case item; the retired tour says nothing
// about what the player would have predicted in this case.
export const createLegacyCaseGuidance = (state: SimulationState): CaseGuidance => {
  const guidance = createCaseGuidance(state);
  const resolvedIds = new Set(state.inbox.filter(message =>
    !message.requiresAction && message.resolution).map(message => message.id));
  const predictions = [1, 2, 3].map(round =>
    CASE_REQUIRED_EVENTS[round as CaseRound].some(id => resolvedIds.has(id))
      ? CASE_LEGACY_PREDICTION : null) as CaseGuidance['predictions'];
  return { ...guidance, predictions };
};

export const recordCasePrediction = (state: SimulationState, choice: string): SimulationState => {
  const round = getCaseRound(state);
  if (!round || !CASE_PREDICTIONS[round].options.some(option => option.id === choice) ||
    state.authoredCase!.guidance.predictions[round - 1] !== null) return state;
  const predictions = [...state.authoredCase!.guidance.predictions] as CaseGuidance['predictions'];
  predictions[round - 1] = choice;
  return { ...state, authoredCase: { ...state.authoredCase!, guidance: { ...state.authoredCase!.guidance, predictions } } };
};

export const recordCaseReflection = (state: SimulationState, choice: string): SimulationState => {
  const round = getCaseRound(state);
  if (!round || !CASE_REFLECTIONS[round].options.some(option => option.id === choice) ||
    state.authoredCase!.guidance.reflections[round - 1] !== null ||
    getCaseRequiredDecisionBlocker(state)) return state;
  const reflections = [...state.authoredCase!.guidance.reflections] as CaseGuidance['reflections'];
  reflections[round - 1] = choice;
  return { ...state, authoredCase: { ...state.authoredCase!, guidance: { ...state.authoredCase!.guidance, reflections } } };
};

export const recordCaseApplication = (state: SimulationState, choice: string): SimulationState => {
  if (state.authoredCase?.status !== 'completed' || state.authoredCase.guidance.application !== null ||
    !CASE_APPLICATION.options.some(option => option.id === choice)) return state;
  return { ...state, authoredCase: { ...state.authoredCase, guidance: { ...state.authoredCase.guidance, application: choice } } };
};

export const setCaseGuidancePaused = (state: SimulationState, paused: boolean): SimulationState =>
  state.authoredCase?.status === 'active' && state.authoredCase.guidance.paused !== paused
    ? { ...state, authoredCase: { ...state.authoredCase,
        guidance: { ...state.authoredCase.guidance, paused } } } : state;

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
  const state: SimulationState = {
    ...base,
    clients: base.clients.map(client => client.id === CASE_ANCHOR_ID
      ? { ...client, contractMonthsRemaining: 3 } : client),
    financials: { ...base.financials, cashOnHand: cash },
    financialHistory: base.financialHistory.map(entry => ({ ...entry, openingCash: cash, cashOnHand: cash })),
    receivables,
    arAging: { current: 15000, thirtyDay: 0, sixtyDay: 18000, ninetyPlus: 0 },
    inbox: [collectionMessage()],
    authoredCase: null,
  };
  return { ...state, authoredCase: { status: 'active', renewalOutcome: null,
    guidance: createCaseGuidance(state) } };
};

export const getCaseRequiredDecisionBlocker = (state: SimulationState): string | null => {
  if (state.authoredCase?.status !== 'active') return null;
  const round = getCaseRound(state);
  const required = round ? CASE_REQUIRED_EVENTS[round] : [];
  if (required.length === 0) return 'This case is waiting for its scheduled round. Open the Inbox or leave the case to continue freely.';
  const outstanding = required.find(id => !state.inbox.some(message => id === message.id && !message.requiresAction && message.resolution));
  if (!outstanding) return null;
  if (outstanding === CASE_EVENT_IDS.intakeReview)
    return 'Complete the February intake review in the Inbox before advancing. Review uses no partner intervention.';
  const label = outstanding === CASE_EVENT_IDS.collection ? 'January collection decision'
    : outstanding === CASE_EVENT_IDS.prospect ? 'February prospect decision'
        : outstanding === CASE_EVENT_IDS.policy ? 'March policy response' : 'March GlobalCorp complaint';
  return `Choose the ${label} in the Inbox before advancing. Hold or defer is a valid choice.`;
};

export const getCaseAdvanceBlocker = (state: SimulationState): string | null => {
  const round = getCaseRound(state);
  if (!round) return state.authoredCase?.status === 'active'
    ? 'This case is waiting for its scheduled round. Open the Inbox or leave the case to continue freely.' : null;
  if (!state.authoredCase!.guidance.predictions[round - 1])
    return `Record the ${['January', 'February', 'March'][round - 1]} prediction in the case guide before advancing. “I'm not sure” is fine.`;
  const decision = getCaseRequiredDecisionBlocker(state);
  if (decision) return decision;
  if (!state.authoredCase!.guidance.reflections[round - 1])
    return `Record the ${['January', 'February', 'March'][round - 1]} reflection in the case guide before advancing. “I'm not sure” is fine.`;
  return null;
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
