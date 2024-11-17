import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface Props {
  data?: { wpm: string; count: number }[];
}

const generateBellCurveData = () => {
  const data: { wpm: number; count: number }[] = [];

  // Parameters for the bell curve
  const mean = 150;
  const standardDev = 40;
  const amplitude = 100;

  // Generate points from 0 to 300
  for (let x = 0; x <= 300; x += 10) {
    // Bell curve formula with noise
    const bellCurve =
      amplitude *
      Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(standardDev, 2)));
    const noise = (Math.random() - 0.5) * 10; // Random noise between -5 and 5

    data.push({
      wpm: x,
      count: Math.max(0, bellCurve + noise), // Ensure no negative values
    });
  }

  return data;
};

const testData = generateBellCurveData();

export const PercentileBarChart: React.FC<Props> = ({ data = testData }) => {
  const series: ApexOptions["series"] = React.useMemo(() => {
    const ser: ApexAxisChartSeries = [
      {
        name: "Value",
        data: data.map((item, i) => ({
          x: item.wpm,
          y: item.count,
          fillColor: i === 10 ? "var(--accent)" : "var(--base-600)",
        })),
      },
    ];
    return ser;
  }, [data]);

  const options: ApexOptions = React.useMemo(() => {
    const opts: ApexOptions = {
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      grid: {
        borderColor: "var(--base-600)",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 2,
          borderRadiusApplication: "end",
          columnWidth: "97%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
      },
      xaxis: {
        categories: data.map((item) => item.wpm),
        title: {
          text: "WPM",
          style: {
            color: "var(--base-300)",
          },
        },
        labels: {
          style: {
            colors: "var(--base-300)",
          },
        },
        type: "numeric",
      },
      yaxis: {
        show: false,
        title: {
          text: "Player count",
          style: {
            color: "var(--base-300)",
          },
        },
        labels: {
          formatter: (val) => val.toFixed(0),
          style: {
            colors: "var(--base-300)",
          },
        },
      },
      tooltip: {
        enabled: false,
      },
    };

    return opts;
  }, [data]);

  return (
    <div className="w-full">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={300}
      />
    </div>
  );
};
