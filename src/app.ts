import {
  calculateProjection,
  estimateFinancialIndependence,
  formatMoney,
  formatPercent,
} from "./calculations";
import { renderChart } from "./chart";
import { DEFAULTS, loadInputs, saveInputs } from "./storage";
import type { ProjectionInput, Scenario } from "./types";

const fieldIds = Object.keys(DEFAULTS) as Array<keyof ProjectionInput>;

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Required page element #${id} was not found.`);
  return element as T;
}

function readInputs(): ProjectionInput {
  const currencyValue = requiredElement<HTMLSelectElement>("currency").value;
  const input: ProjectionInput = {
    currency: currencyValue as ProjectionInput["currency"],
    startingBalance: Number(requiredElement<HTMLInputElement>("startingBalance").value),
    monthlyContribution: Number(
      requiredElement<HTMLInputElement>("monthlyContribution").value,
    ),
    annualReturn: Number(requiredElement<HTMLInputElement>("annualReturn").value),
    years: Number(requiredElement<HTMLInputElement>("years").value),
    inflation: Number(requiredElement<HTMLInputElement>("inflation").value),
    contributionIncrease: Number(
      requiredElement<HTMLInputElement>("contributionIncrease").value,
    ),
    currentAge: Number(requiredElement<HTMLInputElement>("currentAge").value),
    annualSpending: Number(requiredElement<HTMLInputElement>("annualSpending").value),
    withdrawalRate: Number(requiredElement<HTMLInputElement>("withdrawalRate").value),
  };

  input.startingBalance = Math.max(0, input.startingBalance || 0);
  input.monthlyContribution = Math.max(0, input.monthlyContribution || 0);
  input.annualSpending = Math.max(0, input.annualSpending || 0);
  return input;
}

function setText(id: string, value: string): void {
  requiredElement<HTMLElement>(id).textContent = value;
}

function updateLabels(input: ProjectionInput): void {
  setText("returnOutput", formatPercent(input.annualReturn));
  setText("yearsOutput", `${input.years} ${input.years === 1 ? "year" : "years"}`);
  setText("inflationOutput", formatPercent(input.inflation));
  setText("withdrawalOutput", formatPercent(input.withdrawalRate));
  setText("realInflation", formatPercent(input.inflation));

  const symbols: Record<ProjectionInput["currency"], string> = {
    CAD: "CA$",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  for (const id of ["currencyPrefix", "currencyPrefix2", "currencyPrefix3"]) {
    setText(id, symbols[input.currency]);
  }
}

function renderScenarios(input: ProjectionInput): void {
  const scenarios: Scenario[] = [
    { label: "Conservative", rate: 4, note: "Lower-growth illustration" },
    {
      label: "Baseline",
      rate: input.annualReturn,
      note: "Your selected return",
      selected: true,
    },
    { label: "Optimistic", rate: 10, note: "Higher-growth illustration" },
  ];
  const seen = new Set<string>();
  const cards = scenarios
    .filter((scenario) => {
      const key = scenario.rate.toFixed(2);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((scenario) => {
      const result = calculateProjection(input, scenario.rate);
      return `<div class="scenario-card ${scenario.selected ? "scenario-selected" : ""}">
        <div class="scenario-card-top"><span>${scenario.label}</span><b>${formatPercent(scenario.rate)}</b></div>
        <strong>${formatMoney(result.finalBalance, input.currency, true)}</strong>
        <small>${scenario.note}</small>
      </div>`;
    })
    .join("");
  requiredElement<HTMLDivElement>("scenarioGrid").innerHTML = cards;
}

function renderFinancialIndependence(
  input: ProjectionInput,
  finalBalance: number,
): void {
  const target =
    input.withdrawalRate > 0
      ? input.annualSpending / (input.withdrawalRate / 100)
      : Number.POSITIVE_INFINITY;
  const annualIncome = finalBalance * (input.withdrawalRate / 100);
  const monthlyIncome = annualIncome / 12;

  setText("fiNumber", Number.isFinite(target) ? formatMoney(target, input.currency) : "—");
  setText("annualIncome", formatMoney(annualIncome, input.currency));
  setText("monthlyIncome", formatMoney(monthlyIncome, input.currency));

  const progress =
    Number.isFinite(target) && target > 0
      ? Math.min(100, (input.startingBalance / target) * 100)
      : 0;
  setText("fiProgressLabel", formatPercent(progress));
  requiredElement<HTMLElement>("fiProgressBar").style.width = `${progress}%`;
  setText(
    "fiProgressCaption",
    `${formatMoney(input.startingBalance, input.currency)} of ${formatMoney(target, input.currency)} starting portfolio`,
  );

  const estimate = Number.isFinite(target)
    ? estimateFinancialIndependence(input, target)
    : null;
  if (estimate?.months === 0) {
    setText("yearsToFi", "Already there");
    setText("fiAge", `At age ${Math.round(input.currentAge)}`);
  } else if (estimate?.years !== undefined) {
    setText("yearsToFi", `${estimate.years.toFixed(1)} years`);
    setText("fiAge", `Around age ${estimate.age.toFixed(1)}`);
  } else {
    setText("yearsToFi", "Not reached");
    setText("fiAge", "Try increasing contributions or horizon");
  }
}

function render(): void {
  const input = readInputs();
  const projection = calculateProjection(input);
  const money = (value: number) => formatMoney(value, input.currency);

  updateLabels(input);
  setText("futureValue", money(projection.finalBalance));
  setText(
    "futureValueCaption",
    `In ${input.years} ${input.years === 1 ? "year" : "years"}`,
  );
  setText("contributionsValue", money(projection.totalDeposits));
  setText("growthValue", money(projection.growth));
  setText("realValue", money(projection.realValue));
  setText("breakdownContributions", money(projection.totalDeposits));
  setText("breakdownGrowth", money(projection.growth));

  const share =
    projection.finalBalance > 0 ? projection.growth / projection.finalBalance : 0;
  setText("growthShare", `${Math.round(share * 100)}%`);
  requiredElement<HTMLElement>("breakdownDonut").style.background =
    `conic-gradient(#16a477 0deg ${share * 360}deg, #a8b7c6 ${share * 360}deg 360deg)`;
  setText("chartEndLabel", `Year ${input.years}`);

  renderChart(
    requiredElement<HTMLCanvasElement>("wealthChart"),
    projection,
    input.currency,
  );
  renderFinancialIndependence(input, projection.finalBalance);
  renderScenarios(input);
  saveInputs(input);
}

function reset(): void {
  for (const [id, value] of Object.entries(DEFAULTS)) {
    const control = requiredElement<HTMLInputElement | HTMLSelectElement>(id);
    control.value = String(value);
  }
  render();
}

function initialize(): void {
  const saved = loadInputs();
  for (const [id, value] of Object.entries(saved)) {
    const control = requiredElement<HTMLInputElement | HTMLSelectElement>(id);
    control.value = String(value);
  }

  requiredElement<HTMLFormElement>("projectionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });
  for (const id of fieldIds) {
    const control = requiredElement<HTMLInputElement | HTMLSelectElement>(id);
    control.addEventListener("input", render);
    control.addEventListener("change", render);
  }
  requiredElement<HTMLButtonElement>("resetButton").addEventListener("click", reset);
  render();
}

document.addEventListener("DOMContentLoaded", initialize);
