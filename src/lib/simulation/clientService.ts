import type { Employee, SimulationState } from '@/types/simulation';

type ServiceRoster = Pick<SimulationState, 'employees' | 'clients'>;

const getStaffServiceEffectiveness = (employee: Employee): number => {
  const quality = Math.max(0, Math.min(1.25,
    (employee.efficacy * 0.7 + employee.clientAffinity * 0.3) / 80));
  const burnoutFactor = Math.max(0.2, 1 - Math.max(0, employee.burnout - 60) / 50);
  return quality * burnoutFactor;
};

// Each billable employee covers about two clients at baseline quality.
// Support improves the whole team's coordination: no support loses 15% of
// billable capacity, while the initial effective support worker restores it.
export const getClientServiceCapacity = ({ employees }: ServiceRoster): number => {
  let billableCapacity = 0;
  let supportEffectiveness = 0;
  for (const employee of employees) {
    const effectiveness = getStaffServiceEffectiveness(employee);
    if (employee.role === 'Support') supportEffectiveness += effectiveness;
    else billableCapacity += 2 * effectiveness;
  }
  const supportMultiplier = Math.min(1.15, 0.85 + 0.16 * supportEffectiveness);
  return billableCapacity * supportMultiplier;
};

// 1 means enough capacity for the current book. More than 1 gives a modest
// satisfaction benefit, while a shortfall reduces satisfaction and renewals.
export const getClientServiceCoverage = (state: ServiceRoster): number =>
  state.clients.length === 0 ? 1 : getClientServiceCapacity(state) / state.clients.length;
