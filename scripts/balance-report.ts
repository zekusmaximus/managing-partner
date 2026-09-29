import { runBalanceSimulation, type BalanceRun } from '../src/lib/simulation/balanceHarness';

const seeds = [7, 23, 41, 89, 127];
const monthsArgument = process.argv.find(argument => argument.startsWith('--months='));
const months = monthsArgument ? Number(monthsArgument.split('=')[1]) : 24;
const baseline = process.argv.includes('--baseline');
const recovery = baseline ? undefined : await import('../src/lib/simulation/burnout');

const policies = baseline
  ? (['stewardship', 'cash-guard'] as const)
  : (['stewardship', 'cash-guard', 'cash-pressure'] as const);
const runs = policies.flatMap(policy =>
  seeds.map(seed => runBalanceSimulation({
    seed, months, policy,
    fundRecovery: recovery?.fundStaffRecovery,
    getRecoveryQuote: recovery?.getStaffRecoveryQuote,
  })));

const round = (value: number) => Math.round(value * 10) / 10;
const mean = (runs: BalanceRun[], key: keyof BalanceRun) =>
  round(runs.reduce((sum, run) => sum + Number(run[key]), 0) / runs.length);

const rows = policies.map(policy => {
  const selected = runs.filter(run => run.policy === policy);
  return {
    policy,
    cashEnd: mean(selected, 'endingCash'),
    cashMin: mean(selected, 'minimumCash'),
    creditPeak: mean(selected, 'peakCreditDrawn'),
    creditEnd: mean(selected, 'endingCreditDrawn'),
    creditDraws: mean(selected, 'creditDrawnTotal'),
    profit: mean(selected, 'cumulativeProfit'),
    clientsEnd: mean(selected, 'endingClients'),
    serviceCapacityEnd: mean(selected, 'endingServiceCapacity'),
    churn: mean(selected, 'clientChurn'),
    renewals: mean(selected, 'clientRenewals'),
    burnoutEnd: mean(selected, 'endingMeanBurnout'),
    efficacyEnd: mean(selected, 'endingMeanEfficacy'),
    reputationEnd: mean(selected, 'endingReputation'),
    discretionary: mean(selected, 'generatedDiscretionary'),
    tax: mean(selected, 'generatedTax'),
    information: mean(selected, 'generatedInformation'),
    pendingBefore: mean(selected, 'averagePendingBeforeDecisions'),
    pendingAfter: mean(selected, 'averagePendingAfterDecisions'),
    pendingPeak: mean(selected, 'peakPending'),
    pendingEnd: mean(selected, 'endingPending'),
    blockedDecisions: mean(selected, 'blockedDecisions'),
    recoverySpend: mean(selected, 'recoverySpend'),
    fullRecoveryActions: mean(selected, 'fullRecoveryActions'),
    targetedRecoveryActions: mean(selected, 'targetedRecoveryActions'),
  };
});

console.log(JSON.stringify({
  source: baseline ? 'baseline 0e4914f (staff recovery unavailable)' : 'current working tree',
  months,
  seeds,
  summaryMeanAcrossSeeds: rows,
  perSeed: runs.map(({ monthly, ...run }) => run),
}, null, 2));
