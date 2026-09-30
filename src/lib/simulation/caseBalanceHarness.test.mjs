import { describe, expect, test } from 'bun:test';
import { CASE_BALANCE_BRANCHES, runCaseBalanceBranch } from './caseBalanceHarness';

const seeds = [7, 23, 41, 89, 127];

describe('guided-case balance branches', () => {
  test('the same opening fixture and choices reproduce all three completed paths', () => {
    for (const branch of Object.keys(CASE_BALANCE_BRANCHES)) {
      for (const seed of seeds) {
        const run = runCaseBalanceBranch(seed, branch);
        expect(run).toEqual(runCaseBalanceBranch(seed, branch));
        expect(run.caseStatus).toBe('completed');
        expect(run.months.map(item => item.month)).toEqual([2, 3, 4]);
        expect(run.months[0].cash).toBe(50000);
        expect(run.pendingCaseDecisions).toBe(0);
        expect(run.pendingOtherDecisions).toBe(0);
        expect(run.creditDrawTotal).toBeGreaterThan(0);
        expect(run.peakCreditDrawn).toBeLessThanOrEqual(100000);
        expect(run.endingMeanBurnout).toBeGreaterThanOrEqual(0);
        expect(run.endingMeanBurnout).toBeLessThanOrEqual(100);
        expect(run.endingMeanEfficacy).toBeGreaterThanOrEqual(0);
        expect(run.endingMeanEfficacy).toBeLessThanOrEqual(100);
      }
    }
    expect(() => runCaseBalanceBranch(0.5, 'hold-and-defer')).toThrow();
    expect(() => runCaseBalanceBranch(7, 'unknown')).toThrow();
  });

  test('the scripted branches retain actual pursuit costs, shared attention, and uncertain outcomes', () => {
    const decline = seeds.map(seed => runCaseBalanceBranch(seed, 'decline-and-serve'));
    const pursue = seeds.map(seed => runCaseBalanceBranch(seed, 'pursue-and-prioritize'));
    const hold = seeds.map(seed => runCaseBalanceBranch(seed, 'hold-and-defer'));
    expect(decline.every(run => !run.prospectSigned && run.pursuitExpense === 0 &&
      run.partnerInterventionsUsed === 1)).toBe(true);
    expect(pursue.every(run => run.pursuitExpense === 3000 &&
      run.partnerInterventionsUsed === 2)).toBe(true);
    expect(hold.every(run => !run.prospectSigned && run.pursuitExpense === 0 &&
      run.partnerInterventionsUsed === 0)).toBe(true);
    expect(pursue.some(run => run.prospectSigned)).toBe(true);
    expect(pursue.some(run => !run.prospectSigned)).toBe(true);
    expect([...decline, ...hold].some(run => run.renewalOutcome === 'renewed')).toBe(true);
    expect([...decline, ...hold].some(run => run.renewalOutcome === 'departed')).toBe(true);
  });
});
