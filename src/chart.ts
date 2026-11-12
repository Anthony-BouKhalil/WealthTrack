import Chart from "chart.js/auto";
import type { ChartConfiguration } from "chart.js";
import { formatMoney } from "./calculations";
import type { Currency, ProjectionResult } from "./types";

let wealthChart: Chart<"line"> | undefined;

export function renderChart(
  canvas: HTMLCanvasElement,
  projection: ProjectionResult,
  currency: Currency,
): void {
  wealthChart?.destroy();

  const config: ChartConfiguration<"line"> = {
    type: "line",
    data: {
      labels: projection.points.map((point) =>
        point.year === 0 ? "Today" : `Year ${point.year}`,
      ),
      datasets: [
        {
          label: "Portfolio value",
          data: projection.points.map((point) => point.balance),
          borderColor: "#16a477",
          backgroundColor: "rgba(22,164,119,.10)",
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
        {
          label: "Contributions",
          data: projection.points.map((point) => point.deposits),
          borderColor: "#a8b7c6",
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#13243a",
          padding: 12,
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${formatMoney(context.parsed.y ?? 0, currency)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#9aa5af", maxTicksLimit: 8 },
          border: { display: false },
        },
        y: {
          grid: { color: "#edf1f3" },
          ticks: {
            color: "#9aa5af",
            callback: (value) => formatMoney(Number(value), currency, true),
          },
          border: { display: false },
        },
      },
    },
  };

  wealthChart = new Chart(canvas, config);
}
