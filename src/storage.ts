import type { ProjectionInput } from "./types";

const STORAGE_KEY = "wealthtrack-settings-v2";

export const DEFAULTS: ProjectionInput = {
  currency: "CAD",
  startingBalance: 25_000,
  monthlyContribution: 1_500,
  annualReturn: 7,
  years: 20,
  inflation: 2,
  contributionIncrease: 0.03,
  currentAge: 25,
  annualSpending: 50_000,
  withdrawalRate: 4,
};

const currencies = new Set(["CAD", "USD", "EUR", "GBP"]);
const numericFields: Array<keyof Omit<ProjectionInput, "currency">> = [
  "startingBalance",
  "monthlyContribution",
  "annualReturn",
  "years",
  "inflation",
  "contributionIncrease",
  "currentAge",
  "annualSpending",
  "withdrawalRate",
];

export function saveInputs(input: ProjectionInput): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
  } catch (error) {
    console.warn("WealthTrack could not save settings to local storage.", error);
  }
}

export function loadInputs(): Partial<ProjectionInput> {
  try {
    const saved: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "null",
    );
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};

    const values = saved as Record<string, unknown>;
    const result: Partial<ProjectionInput> = {};
    if (typeof values.currency === "string" && currencies.has(values.currency)) {
      result.currency = values.currency as ProjectionInput["currency"];
    }
    for (const field of numericFields) {
      const value = values[field];
      if (typeof value === "number" && Number.isFinite(value)) {
        result[field] = value;
      }
    }
    return result;
  } catch (error) {
    console.warn("WealthTrack could not load settings from local storage.", error);
    return {};
  }
}
