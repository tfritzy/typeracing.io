import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { BorderColor, VeryChillBorder } from "./constants";
import { ErrorsAtTime } from "./compiled";

const secondaryColor = "#555555";
const areaColor = "#00000022";
const textColor = "#888888";

export type Series = {
 name: string;
 data: number[];
};

type LineChartProps = {
 series: Series[];
 errors: ErrorsAtTime[];
};

export const LineChart = (props: LineChartProps) => {
 const getOptions = (
  yMax: number,
  errors_at_time: ErrorsAtTime[]
 ): ApexOptions => {
  const xAxis: NonNullable<
   ApexOptions["annotations"]
  >["xaxis"] = [];
  if (errors_at_time.length > 0) {
   for (let i = 0; i < errors_at_time.length - 1; i++) {
    if (errors_at_time[i]?.error_count) {
     let indexBackToZero = i;
     while (
      indexBackToZero < errors_at_time.length &&
      errors_at_time[indexBackToZero]?.error_count
     ) {
      indexBackToZero++;
     }

     xAxis.push({
      x: errors_at_time[i].time,
      x2: errors_at_time[indexBackToZero].time,
      fillColor: "#dc2626",
      opacity: 0.12,
      borderColor: BorderColor,
      strokeDashArray: 0,
      borderWidth: 100,
     });

     i = indexBackToZero;
    }
   }
  }

  return {
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
    width: 2,
    colors: [secondaryColor, "var(--accent)"],
    lineCap: "square",
   },
   markers: {
    colors: [secondaryColor, "var(--accent)"],
    size: 0,
    strokeWidth: 0,
   },
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
    borderColor: VeryChillBorder,
    show: true,
    xaxis: {
     lines: {
      show: true,
     },
    },
   },
   annotations: {
    xaxis: xAxis,
   },
   yaxis: {
    title: {
     // text: "",
     style: {
      color: textColor,
      fontWeight: 300,
     },
    },
    forceNiceScale: true,
    tickAmount: 3,
    max: yMax,
    min: 0,
    decimalsInFloat: 0,
    labels: {
     style: {
      colors: textColor,
     },
    },
    axisBorder: {
     show: false,
     color: textColor,
     offsetX: -1,
    },
   },
   xaxis: {
    title: {
     // text: "",
     offsetY: -8,
     style: {
      color: textColor,
      fontWeight: 500,
     },
    },
    type: "numeric",
    tickAmount: 5,
    decimalsInFloat: 0,
    axisTicks: {
     show: false,
    },
    axisBorder: {
     show: false,
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
  };
 };

 const highestY = Math.max(
  ...props.series.map((s) => Math.max(...s.data))
 );

 const fullOptions = getOptions(
  highestY + 20,
  props.errors
 );

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
