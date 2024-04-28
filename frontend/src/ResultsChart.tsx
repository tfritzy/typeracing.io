import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const secondaryColor = "#555555";
const areaColor = "#00000022";
const textColor = "#888888";

export type Series = {
  name: string;
  data: number[];
};

type LineChartProps = {
  series: Series[];
  playerColor: string;
};

export const LineChart = (props: LineChartProps) => {
  const getOptions = (yMax: number): ApexOptions => ({
    chart: {
      id: "simple-line",
      background: "transparent",
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: "solid",
      colors: ["transparent", areaColor],
    },
    stroke: {
      curve: "monotoneCubic",
      width: 1,
      colors: [secondaryColor, props.playerColor],
      lineCap: "square",
    },
    // markers: {
    //   colors: [secondaryColor, primaryColor],
    //   size: 0,
    //   strokeWidth: 0,
    // },
    dataLabels: {
      enabled: false,
    },
    theme: {
      mode: "dark",
    },
    tooltip: {
      theme: "custom",
      y: {
        formatter: (val: number) => val.toFixed(0),
      },
      x: {
        show: false,
      },
      marker: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
    },
    yaxis: {
      title: {
        text: "WPM",
        style: {
          color: textColor,
          fontWeight: 500,
        },
      },
      forceNiceScale: true,
      max: yMax,
      min: 0,
      decimalsInFloat: 0,
      labels: {
        style: {
          colors: textColor,
        },
      },
      axisBorder: {
        show: true,
        color: textColor,
        offsetX: -1,
      },
    },
    xaxis: {
      title: {
        text: "Time (s)",
        offsetY: -8,
        style: {
          color: textColor,
          fontWeight: 500,
        },
      },
      type: "numeric",
      tickAmount: 10,
      decimalsInFloat: 0,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: true,
        color: textColor,
        offsetY: 1,
      },
      labels: {
        offsetY: -2,
        style: {
          colors: textColor,
        },
      },
    },
  });

  const highestY = Math.max(...props.series.map((s) => Math.max(...s.data)));

  const fullOptions = getOptions(highestY + 20);

  // Render the Chart component
  return (
    <Chart
      options={fullOptions}
      series={props.series}
      type="area"
      width="100%"
      height="300"
    />
  );
};
