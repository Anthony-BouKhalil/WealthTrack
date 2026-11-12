import type {
  FinancialIndependenceEstimate,
  ProjectionInput,
  ProjectionResult,
} from "./types";

export function calculateProjection(
  input: ProjectionInput,
  annualReturn = input.annualReturn,
): ProjectionResult {
  const months = input.years * 12;
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  let balance = input.startingBalance;
  let deposits = input.startingBalance;
  const points = [{ year: 0, balance, deposits }];

  for (let month = 1; month <= months; month += 1) {
    balance *= 1 + monthlyRate;
    const yearIndex = Math.floor((month - 1) / 12);
    const contribution =
      input.monthlyContribution *
      Math.pow(1 + input.contributionIncrease, yearIndex);
    balance += contribution;
    deposits += contribution;

    if (month % 12 === 0) {
      points.push({ year: month / 12, balance, deposits });
    }
  }

  return {
    points,
    finalBalance: balance,
    totalDeposits: deposits,
    growth: Math.max(0, balance - deposits),
    realValue:
      balance / Math.pow(1 + input.inflation / 100, input.years),
  };
}

export function estimateFinancialIndependence(
  input: ProjectionInput,
  fiTarget: number,
): FinancialIndependenceEstimate | null {
  if (input.startingBalance >= fiTarget) {
    return { months: 0, age: input.currentAge };
  }
  if (input.monthlyContribution <= 0 && input.annualReturn <= 0) {
    return null;
  }

  const monthlyRate = Math.pow(1 + input.annualReturn / 100, 1 / 12) - 1;
  let balance = input.startingBalance;

  for (let month = 1; month <= 1200; month += 1) {
    balance *= 1 + monthlyRate;
    const yearIndex = Math.floor((month - 1) / 12);
    balance +=
      input.monthlyContribution *
      Math.pow(1 + input.contributionIncrease, yearIndex);

    if (balance >= fiTarget) {
      const years = month / 12;
      return { months: month, years, age: input.currentAge + years };
    }
    if (!Number.isFinite(balance) || balance > 1e15) break;
  }

  return null;
}

export function formatMoney(
  value: number,
  currency: ProjectionInput["currency"],
  compact = false,
): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
