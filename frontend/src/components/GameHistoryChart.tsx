import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

type Props = {
  points: { value: number; special: boolean }[][];
};

export function GameHistoryChart({ points }: Props) {
  // Transform data into series format
  const regularSeries = points.map((gamePoints, gameIndex) => ({
    name: `Game ${gameIndex + 1}`,
    data: gamePoints
      .map((point, turnIndex) =>
        !point.special ? [turnIndex, point.value] : null
      )
      .filter((point): point is [number, number] => point !== null),
  }));

  const specialSeries = points.map((gamePoints, gameIndex) => ({
    name: `Game ${gameIndex + 1} (Special)`,
    data: gamePoints
      .map((point, turnIndex) =>
        point.special ? [turnIndex, point.value] : null
      )
      .filter((point): point is [number, number] => point !== null),
  }));

  // Filter out empty series
  const filteredRegularSeries = regularSeries.filter(
    (series) => series.data.length > 0
  );
  const filteredSpecialSeries = specialSeries.filter(
    (series) => series.data.length > 0
  );

  const options: ApexOptions = {
    chart: {
      type: "scatter",
      zoom: {
        enabled: true,
        type: "xy",
      },
    },
    colors: [
      // Regular points - blue shades
      "#1e88e5",
      "#1976d2",
      "#1565c0",
      "#0d47a1",
      // Special points - accent color
      "var(--accent)",
      "var(--accent)",
      "var(--accent)",
      "var(--accent)",
    ],
    xaxis: {
      tickAmount: Math.min(10, Math.max(...points.map((game) => game.length))),
      labels: {
        formatter: (val: number) => Math.round(val).toString(),
      },
      title: {
        text: "Turn",
      },
    },
    yaxis: {
      title: {
        text: "Value",
      },
    },
    markers: {
      size: 6,
      strokeWidth: 0,
      hover: {
        size: 8,
      },
    },
    tooltip: {
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const series = w.config.series[seriesIndex];
        const point = series.data[dataPointIndex];
        const isSpecial = seriesIndex >= filteredRegularSeries.length;
        return `
          <div class="p-2">
            <div>${series.name}</div>
            <div>Turn: ${point[0] + 1}</div>
            <div>Value: ${point[1]}</div>
            ${isSpecial ? "<div>Special Point</div>" : ""}
          </div>
        `;
      },
    },
    legend: {
      show: points.length > 1,
    },
  };

  return (
    <div className="w-full h-96">
      <ReactApexChart
        options={options}
        series={[...filteredRegularSeries, ...filteredSpecialSeries]}
        type="scatter"
        height="100%"
      />
    </div>
  );
}
