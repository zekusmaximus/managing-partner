"use client";

import { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Paper, Typography,
} from '@mui/material';
import Link from 'next/link';
import { useSimulation } from '@/context/SimulationContext';
import {
  CASE_APPLICATION, CASE_EVENT_IDS, CASE_LEGACY_PREDICTION, CASE_PREDICTIONS, CASE_REFLECTIONS,
  getCaseAdvanceBlocker, getCaseRequiredDecisionBlocker, getCaseRound,
} from '@/lib/simulation/authoredCase';
import type { CaseDecisionEvidence, CaseMonthlyEvidence, CaseRound, SimulationState } from '@/types/simulation';

const months: Record<CaseRound, string> = { 1: 'January', 2: 'February', 3: 'March' };
const titles: Record<CaseRound, string> = {
  1: 'Collect an overdue account',
  2: 'Review a new mandate',
  3: 'Respond to a policy delay',
};
const briefs: Record<CaseRound, string> = {
  1: 'TechTrade has $18,000 in invoices billed 61–90 days ago. Its renewal comes in April. Billed profit is not cash in the bank.',
  2: 'An $18,000/month opposing advocacy mandate needs conflict review. Only a separate $12,000/month monitoring scope may be considered. A signing would add one service slot.',
  3: 'The committee postponed TechTrade’s issue despite a delivered scan and memo. GlobalCorp also needs a response. Both clients compete for one major partner intervention.',
};
const predictionLessons: Record<CaseRound, string> = {
  1: 'Payment of an already billed invoice raises cash and lowers receivables without adding profit. A write-off or hold has a different result.',
  2: 'A signed client adds service demand. Declining, holding, or an unsuccessful pursuit adds no client; pursuit may still cost cash.',
  3: 'The firm can change its client response, expense, and use of partner attention. It cannot control the committee’s new date.',
};
const reflectionLessons: Record<CaseRound, string> = {
  1: 'An old invoice was already counted as revenue. Collection exchanges receivables for cash; a write-off reduces receivables and profit.',
  2: 'Intake blocked the original opposing advocacy mandate. The reviewed scope still carried signing uncertainty and service demand if signed.',
  3: 'The postponement was external. Client updates and partner attention can affect service and trust, but neither guarantees a policy date or renewal.',
};
const eventNames: Record<string, string> = {
  [CASE_EVENT_IDS.collection]: 'TechTrade collection',
  [CASE_EVENT_IDS.intakeReview]: 'Intake review',
  [CASE_EVENT_IDS.prospect]: 'Reviewed monitoring scope',
  [CASE_EVENT_IDS.policy]: 'TechTrade update',
  [CASE_EVENT_IDS.complaint]: 'GlobalCorp response',
};
const roundEvents: Record<CaseRound, readonly string[]> = {
  1: [CASE_EVENT_IDS.collection],
  2: [CASE_EVENT_IDS.intakeReview, CASE_EVENT_IDS.prospect],
  3: [CASE_EVENT_IDS.policy, CASE_EVENT_IDS.complaint],
};
const caseEventIds = new Set<string>(Object.values(CASE_EVENT_IDS));

const money = (value: number) => '$' + Math.abs(value).toLocaleString();
const balance = (value: number) => (value < 0 ? '−' : '') + money(value);
const delta = (value: number) => (value > 0 ? '+' : value < 0 ? '−' : '') + money(value);
const points = (value: number) => (value > 0 ? '+' : '') + value + ' pts';
const percent = (value: number) => Math.round(value * 100) + '%';
const decisionsFor = (state: SimulationState, round: CaseRound) =>
  state.authoredCase!.guidance.decisions.filter(item => roundEvents[round].includes(item.messageId));
const choiceLabel = (state: SimulationState, decision: CaseDecisionEvidence) =>
  state.inbox.find(item => item.id === decision.messageId)?.choices
    .find(choice => choice.id === decision.choiceId)?.label ?? decision.choiceId;

function DecisionResult({ state, decision }: { state: SimulationState; decision: CaseDecisionEvidence }) {
  return (
    <Box sx={{ py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" fontWeight={700}>
        {eventNames[decision.messageId] ?? 'Case decision'} · {choiceLabel(state, decision)}
      </Typography>
      <Typography variant="body2">{decision.summary}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Immediate: cash {delta(decision.cashDelta)}; receivables {delta(decision.arDelta)};
        {' '}profit {delta(decision.profitDelta)}; client satisfaction {points(decision.satisfactionDelta)};
        {' '}clients {decision.clientDelta > 0 ? '+' : ''}{decision.clientDelta};
        {' '}partner intervention {decision.usedPartnerIntervention ? 'used' : 'not used'}.
      </Typography>
    </Box>
  );
}

function MonthlyRecap({ state, evidence }: { state: SimulationState; evidence: CaseMonthlyEvidence }) {
  const actions = decisionsFor(state, evidence.round).map(decision =>
    (eventNames[decision.messageId] ?? 'Case decision') + ': ' + choiceLabel(state, decision));
  const closingAnchorSatisfaction = evidence.closing.anchorSatisfaction ??
    (evidence.round === 3 ? state.authoredCase?.renewal?.satisfaction : null);
  const nextMonth = evidence.round === 3 ? 'April' : months[(evidence.round + 1) as CaseRound];
  const external = evidence.round === 1
    ? 'Satisfaction also has a chance element. Month-start totals do not isolate the collection choice.'
    : evidence.round === 2
      ? 'A reviewed pursuit may sign or fail. The original opposing advocacy scope stayed blocked.'
      : 'The committee delay was external. Renewal used service and satisfaction, then a chance draw.';
  return (
    <Box component="section" aria-label={months[evidence.round] + ' to ' + nextMonth + ' recap'}
      sx={{ p: 1, my: 0.75, bgcolor: 'action.hover', borderRadius: 1 }}>
      <Typography variant="subtitle2" fontWeight={700}>When {nextMonth} began</Typography>
      <Typography variant="body2"><strong>Case decisions:</strong>{' '}
        {actions.length ? actions.join('; ') : 'Older choices were restored without action-level evidence.'}
      </Typography>
      <Typography variant="body2"><strong>Staff and service:</strong> staff roster {evidence.opening.staff} → {evidence.closing.staff};
        {' '}clients {evidence.opening.clients} → {evidence.closing.clients}; coverage {percent(evidence.serviceCoverage)}.
        {evidence.opening.anchorSatisfaction !== null && closingAnchorSatisfaction != null &&
          <> TechTrade satisfaction {Math.round(evidence.opening.anchorSatisfaction)}% → {Math.round(closingAnchorSatisfaction)}%.</>}
      </Typography>
      <Typography variant="body2"><strong>Collections and costs:</strong> routine collections {money(evidence.collections)};
        {' '}recurring cash expenses {money(evidence.recurringCashExpenses)};
        {' '}automatic bad-debt write-off {money(evidence.automaticWriteOff)}.
      </Typography>
      <Typography variant="body2"><strong>Month snapshots:</strong> cash {balance(evidence.opening.cash)} → {balance(evidence.closing.cash)};
        {' '}receivables {balance(evidence.opening.ar)} → {balance(evidence.closing.ar)};
        {' '}profit {balance(evidence.opening.profit)} → {balance(evidence.closing.profit)}.
      </Typography>
      <Typography variant="body2"><strong>Credit:</strong> draw {money(evidence.creditDraw)};
        {' '}repayment {money(evidence.creditRepayment)}. Borrowing is cash, not income.
      </Typography>
      <Typography variant="body2"><strong>External or chance:</strong> {external}</Typography>
    </Box>
  );
}

function AnswerButtons({ id, question, options, onAnswer }: {
  id: string; question: string; options: { id: string; label: string }[]; onAnswer: (id: string) => void;
}) {
  return (
    <Box role="group" aria-labelledby={id} sx={{ mt: 0.75 }}>
      <Typography id={id} variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>{question}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {options.map(option => (
          <Button key={option.id} variant="outlined" size="small" onClick={() => onAnswer(option.id)}
            sx={{ minHeight: 40, flex: { xs: '1 1 100%', sm: '1 1 200px' },
              justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none', whiteSpace: 'normal' }}>
            {option.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

function RoundReview({ state, round }: { state: SimulationState; round: CaseRound }) {
  const decisions = decisionsFor(state, round);
  const resolved = roundEvents[round].map(id => state.inbox.find(item => item.id === id))
    .filter(message => message?.resolution);
  const totals = decisions.reduce((sum, decision) => ({
    cash: sum.cash + decision.cashDelta, ar: sum.ar + decision.arDelta,
    profit: sum.profit + decision.profitDelta,
  }), { cash: 0, ar: 0, profit: 0 });
  const prospect = decisions.find(decision => decision.messageId === CASE_EVENT_IDS.prospect);
  const prospectResolution = state.inbox.find(item => item.id === CASE_EVENT_IDS.prospect)?.resolution;
  const scopeResult = prospectResolution?.choiceId === 'hold'
    ? 'The limited scope stayed unresolved; no fee or service slot was added.'
    : prospectResolution?.choiceId === 'decline'
      ? 'No fee or service slot was added.'
      : !prospect && prospectResolution
        ? 'The saved Inbox resolution above records whether the reviewed client signed.'
        : prospect?.clientDelta === 1
        ? 'The reviewed monitoring client signed and added a service slot.'
        : prospectResolution
          ? 'The reviewed monitoring client did not sign; no service slot was added.'
          : 'No scoped-prospect outcome was saved.';
  const lesson = round === 1
    ? 'Collection of billed work moves cash and receivables; a hold or write-off differs.'
    : round === 2 ? scopeResult : 'The committee date stayed delayed independently of both client responses.';
  return (
    <Box component="section" aria-label={months[round] + ' decision summary'}
      sx={{ py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" fontWeight={700}>{months[round]} · {titles[round]}</Typography>
      <Typography variant="body2">
        {decisions.length
          ? decisions.map(item => (eventNames[item.messageId] ?? 'Case decision') + ': ' + choiceLabel(state, item)).join('; ')
          : resolved.map(item => (eventNames[item!.id] ?? 'Case decision') + ': ' + item!.resolution!.summary).join(' ')}
        {decisions.length || resolved.length ? '. ' : 'No earlier decision detail was saved. '}
        {lesson}
      </Typography>
      {decisions.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Immediate: cash {delta(totals.cash)}; receivables {delta(totals.ar)};
          {' '}profit {delta(totals.profit)}; partner intervention
          {' '}{decisions.some(item => item.usedPartnerIntervention) ? 'used' : 'not used'}.
        </Typography>
      )}
      {decisions.length === 0 && resolved.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          This older save retained the actual Inbox result without action-level numeric deltas.
        </Typography>
      )}
    </Box>
  );
}

export default function CaseStatusPanel() {
  const { state, leaveCase, recordCasePrediction, recordCaseReflection,
    recordCaseApplication, setCaseGuidancePaused } = useSimulation();
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(true);
  const stageHeading = useRef<HTMLHeadingElement | null>(null);
  const applicationFeedback = useRef<HTMLParagraphElement | null>(null);
  const previousStage = useRef<string | null>(null);
  const previousApplication = useRef<string | null | undefined>(undefined);
  const authoredCase = state.authoredCase;
  const round = getCaseRound(state);
  const active = authoredCase?.status === 'active';
  const completed = authoredCase?.status === 'completed';
  const paused = active && authoredCase.guidance.paused;
  const prediction = round ? authoredCase!.guidance.predictions[round - 1] : null;
  const reflection = round ? authoredCase!.guidance.reflections[round - 1] : null;
  const decisionsDone = active ? getCaseRequiredDecisionBlocker(state) === null : false;
  const roundDecisions = round ? decisionsFor(state, round) : [];
  const restoredRoundResults = round ? roundEvents[round].flatMap(id => {
    const message = state.inbox.find(item => item.id === id);
    return message?.resolution && !roundDecisions.some(item => item.messageId === id)
      ? [{ id, summary: message.resolution.summary }] : [];
  }) : [];
  const latestDecision = roundDecisions.at(-1);
  const priorMonthly = round && round > 1
    ? authoredCase!.guidance.monthly.find(item => item.round === round - 1) : null;
  const pending = state.inbox.filter(item => item.requiresAction && caseEventIds.has(item.id));
  const pendingHref = pending[0] ? '/inbox#' + pending[0].id : '/inbox';
  const blocker = active ? getCaseAdvanceBlocker(state) : null;
  const stage = paused ? 'paused'
    : round && !prediction ? 'predict'
      : round && !decisionsDone ? 'decide'
        : round && !reflection ? 'reflect'
          : round ? 'ready' : completed ? 'review' : 'left';
  const stageKey = [state.year, state.month, stage, roundDecisions.length].join('-');

  useEffect(() => {
    const dialogOpen = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (!dialogOpen && previousStage.current !== null && previousStage.current !== stageKey)
      stageHeading.current?.focus();
    previousStage.current = stageKey;
  }, [stageKey]);

  useEffect(() => {
    const application = authoredCase?.guidance.application;
    if (previousApplication.current === null && application) applicationFeedback.current?.focus();
    previousApplication.current = application;
  }, [authoredCase?.guidance.application]);

  if (!authoredCase) return null;
  const heading = round ? months[round] + ' · ' + titles[round]
    : completed ? 'April · Case review' : 'Guided case left';
  const renewal = authoredCase.renewalOutcome === 'renewed'
    ? 'TechTrade Association renewed for another term.'
    : authoredCase.renewalOutcome === 'departed'
      ? 'TechTrade Association departed at renewal.' : null;
  const marchMonthly = authoredCase.guidance.monthly.find(item => item.round === 3);

  return (
    <Paper component="section" square elevation={0} aria-label="Guided case progress"
      sx={{ px: { xs: 2, md: 3 }, py: 1, borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'rgba(25, 118, 210, 0.06)', flexShrink: 0, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
        <Box sx={{ minWidth: 0, flex: '1 1 230px' }}>
          <Typography variant="overline" sx={{ lineHeight: 1.2 }}>
            {round ? 'Guided case · Round ' + round + ' of 3' : completed ? 'Case completed' : 'Guided case'}
          </Typography>
          <Typography variant="subtitle1" component="h2" fontWeight={700} sx={{ lineHeight: 1.25 }}>
            {heading}
          </Typography>
          {active ? (
            <Typography id="case-advance-reason" aria-live="polite" variant="body2" color={blocker ? 'text.primary' : 'text.secondary'}>
              {blocker ?? 'Required answers and case decisions are recorded. Advance Month when ready.'}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">{renewal ?? 'The firm continues in free play.'}</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          {active && (
            <>
              <Button component="a" href={pendingHref} variant="contained" size="small">
                {pending.length > 0 ? 'Inbox (' + pending.length + ' pending)' : 'Open Inbox'}
              </Button>
              <Button variant="outlined" size="small" onClick={() => setCaseGuidancePaused(!paused)}>
                {paused ? 'Resume guide' : 'Pause guide'}
              </Button>
              <Button variant="text" size="small" onClick={() => setLeaveConfirmOpen(true)}>Leave case</Button>
            </>
          )}
          {completed && (
            <Button variant="outlined" size="small" onClick={() => setReviewOpen(!reviewOpen)}
              aria-expanded={reviewOpen} aria-controls="case-guide-content">
              {reviewOpen ? 'Hide review' : 'Show review'}
            </Button>
          )}
        </Box>
      </Box>
      {active && pending.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
          Pending: {pending.map(item => item.title).join('; ')}
        </Typography>
      )}
      {paused && (
        <Typography ref={stageHeading} tabIndex={-1} component="h3" variant="body2" sx={{ mt: 0.75 }}>
          Guidance paused. Your case choices and month stay saved. Resume to answer required prompts.
        </Typography>
      )}
      {((active && !paused) || (completed && reviewOpen)) && (
        <Box id="case-guide-content" component="section" role="region" aria-label="Case guide"
          tabIndex={0} sx={{ mt: 0.75, maxHeight: { xs: 'min(43dvh, 400px)', md: 400 },
            overflowY: 'auto', overscrollBehavior: 'contain', pr: 0.5, minWidth: 0 }}>
          <Typography ref={stageHeading} tabIndex={-1} component="h3" variant="subtitle2" fontWeight={700}>
            {completed ? 'What happened in this run'
              : stage === 'predict' ? 'Predict before you decide'
                : stage === 'decide' ? 'Choose and observe'
                  : stage === 'reflect' ? 'Explain the result' : 'Ready for the next month'}
          </Typography>
          {round && (
            <>
              {stage === 'predict' ? (
                <>
                  {round === 1 && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Three rounds: predict, decide in the Inbox, then reflect. Explore other firm pages as needed.
                      {' '}Hold, defer, and “I’m not sure” are valid. April brings a review; answers are not graded.
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{briefs[round]}</Typography>
                  {priorMonthly && <MonthlyRecap state={state} evidence={priorMonthly} />}
                  <AnswerButtons id="case-prediction-question" question={CASE_PREDICTIONS[round].question}
                    options={CASE_PREDICTIONS[round].options} onAnswer={recordCasePrediction} />
                </>
              ) : (
                <>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {prediction === CASE_LEGACY_PREDICTION ? (
                      'No prediction was recorded in this older case save. Continue with the saved decision(s).'
                    ) : (
                      <><strong>Your prediction:</strong>{' '}
                        {CASE_PREDICTIONS[round].options.find(item => item.id === prediction)?.label}.</>
                    )}
                  </Typography>
                  {latestDecision ? (
                    <>
                      <DecisionResult state={state} decision={latestDecision} />
                      {roundDecisions.length > 1 && (
                        <Box component="details" sx={{ mt: 0.5 }}>
                          <Box component="summary" sx={{ cursor: 'pointer', typography: 'body2', fontWeight: 700 }}>
                            Earlier decision result
                          </Box>
                          {roundDecisions.slice(0, -1).map(item =>
                            <DecisionResult key={item.messageId} state={state} decision={item} />)}
                        </Box>
                      )}
                    </>
                  ) : decisionsDone && restoredRoundResults.length === 0 ? (
                    <Typography variant="body2" sx={{ mt: 0.75 }}>
                      Earlier decisions were restored without action-level evidence. Saved firm balances remain intact.
                    </Typography>
                  ) : null}
                  {restoredRoundResults.length > 0 && (
                    <Box sx={{ mt: 0.75 }}>
                      {restoredRoundResults.map(result => (
                        <Box key={result.id} sx={{ py: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="body2" fontWeight={700}>
                            Saved result · {eventNames[result.id] ?? 'Case decision'}
                          </Typography>
                          <Typography variant="body2">{result.summary}</Typography>
                        </Box>
                      ))}
                      <Typography variant="caption" color="text.secondary">
                        This older save has the actual Inbox result, but no action-level numeric deltas.
                      </Typography>
                    </Box>
                  )}
                  {decisionsDone && (
                    <Typography variant="body2" sx={{ mt: 0.75 }}>{predictionLessons[round]}</Typography>
                  )}
                  {!decisionsDone && (
                    <Typography variant="body2" sx={{ mt: 0.75 }}>
                      {roundDecisions.length === 0 && restoredRoundResults.length === 0
                        ? briefs[round] : 'The next required choice is in the Inbox.'}
                      {' '}<a href={pendingHref}>Open the case decision</a>.
                    </Typography>
                  )}
                  {decisionsDone && !reflection && (
                    <AnswerButtons id="case-reflection-question" question={CASE_REFLECTIONS[round].question}
                      options={CASE_REFLECTIONS[round].options} onAnswer={recordCaseReflection} />
                  )}
                  {reflection && (
                    <Typography variant="body2" sx={{ mt: 0.75 }}>
                      <strong>Your reflection:</strong>{' '}
                      {CASE_REFLECTIONS[round].options.find(item => item.id === reflection)?.label}.
                      {' '}{reflectionLessons[round]} Advance Month when ready.
                    </Typography>
                  )}
                  {priorMonthly && (
                    <Box component="details" sx={{ mt: 0.75 }}>
                      <Box component="summary" sx={{ cursor: 'pointer', typography: 'body2', fontWeight: 700 }}>
                        Review prior service, collections, credit, and chance effects
                      </Box>
                      <MonthlyRecap state={state} evidence={priorMonthly} />
                    </Box>
                  )}
                </>
              )}
            </>
          )}
          {completed && (
            <>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                These are observed results from your firm. The case records practice, not demonstrated mastery.
              </Typography>
              {[1, 2, 3].map(value => <RoundReview key={value} state={state} round={value as CaseRound} />)}
              {marchMonthly && <MonthlyRecap state={state} evidence={marchMonthly} />}
              <Box component="section" aria-label="TechTrade renewal outcome"
                sx={{ py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={700}>TechTrade at renewal</Typography>
                <Typography variant="body2">
                  {renewal ?? 'The saved case has no renewal result.'}
                  {authoredCase.renewal && (
                    <> The model used {percent(authoredCase.renewal.serviceCoverage)} service coverage and
                      {' '}{Math.round(authoredCase.renewal.satisfaction)}% satisfaction, giving a
                      {' '}{percent(authoredCase.renewal.chance)} renewal chance. A chance draw determined
                      {' '}the result; it does not prove which action caused it.</>
                  )}
                </Typography>
              </Box>
              {authoredCase.guidance.application === null ? (
                <AnswerButtons id="case-application-question" question={CASE_APPLICATION.question}
                  options={CASE_APPLICATION.options} onAnswer={recordCaseApplication} />
              ) : (
                <Typography ref={applicationFeedback} tabIndex={-1} variant="body2" sx={{ mt: 0.75 }}>
                  <strong>New situation:</strong> You chose{' '}
                  {CASE_APPLICATION.options.find(item => item.id === authoredCase.guidance.application)?.label}.
                  {' '}Check scope and conflicts, service capacity, and cash commitments before accepting.
                  {' '}This is practice, not a mastery score.
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.75 }}>
                <Button component={Link} href="/" size="small">Continue managing this firm</Button>
                <Button size="small" onClick={(event) => {
                  event.currentTarget.blur();
                  window.dispatchEvent(new Event('mp:open-new-game'));
                }}>
                  New Game
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
      <Dialog open={leaveConfirmOpen} onClose={() => setLeaveConfirmOpen(false)} aria-labelledby="leave-case-title">
        <DialogTitle id="leave-case-title">Leave the guided case?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Keep this firm and continue freely. Unanswered case decisions will be recorded as held,
            and future case events will stop. This will not mark the case complete.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setLeaveConfirmOpen(false)}>Stay in case</Button>
          <Button variant="contained" onClick={() => { leaveCase(); setLeaveConfirmOpen(false); }}>
            Leave case and continue freely
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
