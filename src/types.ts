export type Currency = "CAD" | "USD" | "EUR" | "GBP";

export interface ProjectionInput {
  currency: Currency;
  startingBalance: number;
  monthlyContribution: number;
  annualReturn: number;
  years: number;
  inflation: number;
  contributionIncrease: number;
  currentAge: number;
  annualSpending: number;
  withdrawalRate: number;
}

export interface ProjectionPoint {
  year: number;
  balance: number;
  deposits: number;
}

export interface ProjectionResult {
  points: ProjectionPoint[];
  finalBalance: number;
  totalDeposits: number;
  growth: number;
  realValue: number;
}

export interface FinancialIndependenceEstimate {
  months: number;
  years?: number;
  age: number;
}

export interface Scenario {
  label: string;
  rate: number;
  note: string;
  selected?: boolean;
}
