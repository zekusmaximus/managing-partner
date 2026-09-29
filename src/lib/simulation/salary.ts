import { getEmployeeTotalCost, type SimulationState } from '@/types/simulation';

export const getSalaryIncreaseQuote = (state: SimulationState, employeeId: string, salary: number) => {
  const employee = state.employees.find(item => item.id === employeeId);
  const currentLoadedPayroll = state.employees.reduce((total, item) => total + getEmployeeTotalCost(item), 0);
  const employeeLoadedCost = employee && Number.isFinite(salary)
    ? getEmployeeTotalCost({ ...employee, salary }) : 0;
  const loadedPayroll = currentLoadedPayroll + (employee ? employeeLoadedCost - getEmployeeTotalCost(employee) : 0);
  const disabledReason = !employee ? 'This employee is no longer on the roster.'
    : !Number.isFinite(salary) || !Number.isFinite(loadedPayroll) ? 'Enter a finite monthly salary.'
    : salary < employee.salary ? `Enter at least the current salary of $${employee.salary.toLocaleString()}. Salary reductions are not simulated.`
    : null;
  return {
    employee,
    valid: disabledReason === null,
    isNoOp: employee?.salary === salary,
    disabledReason,
    employeeLoadedCost,
    loadedPayroll,
    addedMonthlyPayroll: loadedPayroll - currentLoadedPayroll,
    effectiveMonth: state.month === 12 ? 1 : state.month + 1,
    effectiveYear: state.month === 12 ? state.year + 1 : state.year,
  };
};

// Always quote against the latest state, including a stale dialog submission.
export const increaseEmployeeSalary = (state: SimulationState, employeeId: string, salary: number): SimulationState => {
  const quote = getSalaryIncreaseQuote(state, employeeId, salary);
  if (!quote.valid || quote.isNoOp) return state;
  return {
    ...state,
    employees: state.employees.map(employee => employee.id === employeeId ? { ...employee, salary } : employee),
  };
};
