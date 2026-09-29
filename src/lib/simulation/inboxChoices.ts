import type { InboxMessage, MessageChoice } from '@/types/simulation';
import { AGGRESSIVE_CLIENT_PURSUIT_COST } from '@/types/simulation';

export const getAggressiveClientPursuitEffect = (monthlyFee: number): string =>
  `70% chance of a $${monthlyFee.toLocaleString()}/mo client; pay $${AGGRESSIVE_CLIENT_PURSUIT_COST.toLocaleString()} now whether or not they sign. Cash and profit fall by this expense; service workload rises if signed.`;

export const getComplaintChoices = (): MessageChoice[] => [
  { id: 'address', label: 'Lead recovery meeting', effect: 'Pay $1,000; satisfaction rises by up to 6. Collect 15% of overdue invoices, capped at $3,000, when present. Uses this month’s partner intervention.' },
  { id: 'assign', label: 'Delegate routine response', effect: 'Satisfaction rises by up to 3; no additional cash expense or partner intervention. Requires billable staff. Uses the already-paid team and does not improve capacity or repair understaffing.' },
  { id: 'ignore', label: 'Defer for now', effect: 'Satisfaction falls by up to 10; no cash expense or partner intervention. Records this complaint as deferred.' },
];

export const getCollectionsChoices = (): MessageChoice[] => [
  { id: 'demand-letter', label: 'Send formal demand', effect: 'Collect 60% of the remaining quoted 61–90 day balance now; client satisfaction falls by up to 5. No cash expense or partner intervention.' },
  { id: 'personal-call', label: 'Personal collection call', effect: 'Collect 40% of the remaining quoted 61–90 day balance now; satisfaction and profit unchanged. No cash expense. Uses this month’s partner intervention.' },
  { id: 'write-off-ar', label: 'Write off and close collection efforts', effect: 'Clear the remaining quoted 61–90 day balance; no cash comes in. Bad debt expense rises and profit falls. This game also ends collection of that amount; accounting write-off alone need not cancel a debt.' },
];

export const getCaseProspectChoices = (fee: number): MessageChoice[] => [
  { id: 'original-scope', label: 'Sign original opposing mandate',
    effect: 'Unavailable: the original opposing advocacy scope has an unresolved conflict and cannot be signed.' },
  { id: 'decline', label: 'Decline the engagement',
    effect: 'No pursuit expense, new fee, or added client workload; capacity remains available for existing clients.' },
  { id: 'hold', label: 'Hold for scope clarification',
    effect: 'No fee, expense, or new workload in this introductory case. The opportunity remains unresolved; do not treat it as approved.' },
  { id: 'initial-contact', label: 'Initial contact on reviewed scope',
    effect: `50% signing chance for the reviewed $${fee.toLocaleString()}/month monitoring assignment; no pursuit expense. If signed, one client slot is added.` },
  { id: 'pursue', label: 'Pursue reviewed scope aggressively', effect: getAggressiveClientPursuitEffect(fee) },
];

// Pending messages always present today's mechanics, including legacy saves.
// Resolved messages retain their historical wording and actual outcome.
export const getCurrentInboxChoices = (message: InboxMessage): MessageChoice[] => {
  if (!message.requiresAction) return message.choices;
  if (message.scenario.kind === 'client-feedback') return getComplaintChoices();
  if (message.scenario.kind === 'collections-problem') return message.id === 'case-2026-01-collection'
    ? [...getCollectionsChoices(), { id: 'hold-collection', label: 'Hold collection decision',
        effect: 'No immediate collection or write-off. Automatic collections and aging still apply on month advance.' }]
    : getCollectionsChoices();
  if (message.scenario.kind === 'case-prospect') {
    return getCaseProspectChoices(message.scenario.monthlyFee);
  }
  const monthlyFee = message.scenario.kind === 'new-client' ? message.scenario.monthlyFee : null;
  return monthlyFee === null ? message.choices : message.choices.map(choice => choice.id === 'pursue'
    ? { ...choice, effect: getAggressiveClientPursuitEffect(monthlyFee) } : choice);
};
