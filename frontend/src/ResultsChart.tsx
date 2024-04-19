import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const options: ApexOptions = {
 chart: {
  id: "simple-line",
 },
 stroke: {
  curve: "smooth",
  width: 2,
 },
 theme: {
  mode: "dark",
 },
 grid: {
  borderColor: "white",
 },
 xaxis: {
  categories: [
   "Jan",
   "Feb",
   "Mar",
   "Apr",
   "May",
   "Jun",
   "Jul",
   "Aug",
   "Sep",
   "Oct",
   "Nov",
   "Dec",
  ],
 },
};

export type Series = {
 name: string;
 data: number[];
};

type LineChartProps = {
 series: Series[];
};

export const LineChart = (props: LineChartProps) => {
 const chartMaxX = Math.max(
  ...props.series.map((wpm) => wpm.data.length)
 );
 const stepSize = Math.ceil(chartMaxX / 10);
 const categories = Array.from(
  { length: chartMaxX },
  (_, i) => i + stepSize
 ).map((i) => i.toString());

 const fullOptions = {
  ...options,
  xaxis: {
   ...options.xaxis,
   categories: categories,
  },
 };

 // Render the Chart component
 return (
  <div className="app">
   <div className="row">
    <div className="mixed-chart">
     <Chart
      options={fullOptions}
      series={props.series}
      type="line"
      width="500"
     />
    </div>
   </div>
  </div>
 );
};
