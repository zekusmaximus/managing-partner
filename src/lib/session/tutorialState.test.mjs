import { describe, expect, test } from 'bun:test';
import {
  createInitialTutorialState,
  isTutorialMonthAdvanceAlreadySatisfied,
} from './tutorialState';

describe('tutorial month checkpoints', () => {
  test('fresh progress is anchored to the opening January 2026 game', () => {
    const tutorial = createInitialTutorialState();
    expect(tutorial.simulationMonthAtStart).toBe(1);
    expect(tutorial.simulationYearAtStart).toBe(2026);
  });

  test('a resumed tutorial does not advance a month already passed', () => {
    const passed = isTutorialMonthAdvanceAlreadySatisfied;
    expect(passed('m1-advance-month', 4, 2026, 4, 2026)).toBe(false);
    expect(passed('m1-advance-month', 4, 2026, 5, 2026)).toBe(true);
    expect(passed('m2-advance-month', 4, 2026, 5, 2026)).toBe(false);
    expect(passed('m2-advance-month', 4, 2026, 6, 2026)).toBe(true);
  });

  test('year rollover and long pauses use absolute month order', () => {
    const passed = isTutorialMonthAdvanceAlreadySatisfied;
    expect(passed('m1-advance-month', 12, 2026, 1, 2027)).toBe(true);
    expect(passed('m2-advance-month', 12, 2026, 1, 2027)).toBe(false);
    expect(passed('m2-advance-month', 12, 2026, 1, 2028)).toBe(true);
    expect(passed('unrelated-step', 12, 2026, 1, 2028)).toBe(false);
  });
});
