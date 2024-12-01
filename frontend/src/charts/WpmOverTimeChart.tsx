import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { ErrorsAtTime } from "../compiled";
import React from "react";

const secondaryColor = "var(--base-300)";
const areaColor = "#00000033";
const textColor = "var(--base-300)";

export type Series = {
  name: string;
  data: number[];
};

type Props = {
  wpm_by_second: number[];
  raw_wpm_by_second: number[];
  errors: ErrorsAtTime[];
};

export const WpmOverTime = (props: Props) => {
  const series = React.useMemo(() => {
    const newWpmData: Series[] = [];
    newWpmData.push({
      name: "raw",
      data: props.raw_wpm_by_second,
    });

    newWpmData.push({
      name: "wpm",
      data: props.wpm_by_second,
    });
    return newWpmData;
  }, [props.raw_wpm_by_second, props.wpm_by_second]);

  const getOptions = (
    yMax: number,
    errors_at_time: ErrorsAtTime[]
  ): ApexOptions => {
    const xAxis: NonNullable<ApexOptions["annotations"]>["xaxis"] = [];
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
            fillColor: "red",
            opacity: 0.15,
            borderColor: "var(--base-700)",
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
        animations: {
          enabled: false,
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
        borderColor: "var(--base-700)",
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

  const highestY = Math.max(...series.map((s) => Math.max(...s.data)));

  const fullOptions = getOptions(highestY + 20, props.errors);

  // Render the Chart component
  return (
    <Chart
      options={fullOptions}
      series={series}
      type="area"
      width="100%"
      height={350}
    />
  );
};
