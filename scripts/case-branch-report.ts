import { CASE_BALANCE_BRANCHES, runCaseBalanceBranch } from '../src/lib/simulation/caseBalanceHarness';

const seeds = [7, 23, 41, 89, 127];
const runs = Object.keys(CASE_BALANCE_BRANCHES).flatMap(branch =>
  seeds.map(seed => runCaseBalanceBranch(seed, branch as keyof typeof CASE_BALANCE_BRANCHES)));
const mean = (values: number[]) => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 10) / 10;

console.log(JSON.stringify({
  fixture: 'January 2026 authored case, unchanged for every branch',
  seeds,
  summary: Object.keys(CASE_BALANCE_BRANCHES).map(branch => {
    const selected = runs.filter(run => run.branch === branch);
    return {
      branch,
      choices: CASE_BALANCE_BRANCHES[branch as keyof typeof CASE_BALANCE_BRANCHES],
      signed: selected.filter(run => run.prospectSigned).length,
      renewed: selected.filter(run => run.renewalOutcome === 'renewed').length,
      departed: selected.filter(run => run.renewalOutcome === 'departed').length,
      pursuitExpense: mean(selected.map(run => run.pursuitExpense)),
      partnerInterventionsUsed: mean(selected.map(run => run.partnerInterventionsUsed)),
      cashEnd: mean(selected.map(run => run.endingCash)),
      creditPeak: mean(selected.map(run => run.peakCreditDrawn)),
      creditDraws: mean(selected.map(run => run.creditDrawTotal)),
      profitFebruaryThroughApril: mean(selected.map(run => run.profitFebruaryThroughApril)),
      serviceCapacityEnd: mean(selected.map(run => run.endingServiceCapacity)),
      burnoutEnd: mean(selected.map(run => run.endingMeanBurnout)),
      efficacyEnd: mean(selected.map(run => run.endingMeanEfficacy)),
      pendingCaseEnd: mean(selected.map(run => run.pendingCaseDecisions)),
      pendingOtherEnd: mean(selected.map(run => run.pendingOtherDecisions)),
    };
  }),
  perSeed: runs,
}, null, 2));
