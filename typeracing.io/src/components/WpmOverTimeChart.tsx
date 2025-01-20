import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import React from "react";
import {
  ErrorsAtTime,
  getAggWpmBySecond,
  getErrorCountByTime,
  getRawWpmBySecond,
  KeyStroke,
} from "../stats";

const secondaryColor = "#57534e";
const areaColor = "#00000033";
const textColor = "#57534e";

export type Series = {
  name: string;
  data: number[];
};

type Data = {
  wpm_by_second: number[];
  raw_wpm_by_second: number[];
  errors: ErrorsAtTime[];
};

type Props = {
  keystrokes: KeyStroke[];
  phrase: string;
};

export const WpmOverTime = (props: Props) => {
  console.log(props.keystrokes);
  const data: Data = React.useMemo(() => {
    return {
      wpm_by_second: getRawWpmBySecond(props.keystrokes),
      raw_wpm_by_second: getAggWpmBySecond(props.keystrokes),
      errors: getErrorCountByTime(props.keystrokes, props.phrase),
    };
  }, [props.keystrokes, props.phrase]);
  console.log(data);

  const series = React.useMemo(() => {
    const newWpmData: Series[] = [];
    newWpmData.push({
      name: "raw",
      data: data.raw_wpm_by_second,
    });

    newWpmData.push({
      name: "wpm",
      data: data.wpm_by_second,
    });
    return newWpmData;
  }, [data.raw_wpm_by_second, data.wpm_by_second]);

  const getOptions = (
    yMax: number,
    errors_at_time: ErrorsAtTime[]
  ): ApexOptions => {
    const xAxis: NonNullable<ApexOptions["annotations"]>["xaxis"] = [];
    if (errors_at_time.length > 0) {
      for (let i = 0; i < errors_at_time.length - 1; i++) {
        if (errors_at_time[i]?.errorCount) {
          let indexBackToZero = i;
          while (
            indexBackToZero < errors_at_time.length &&
            errors_at_time[indexBackToZero]?.errorCount
          ) {
            indexBackToZero++;
          }

          xAxis.push({
            x: errors_at_time[i].time,
            x2: errors_at_time[indexBackToZero].time,
            fillColor: "#fbbf24",
            opacity: 0.15,
            borderColor: "#29252400",
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
          show: true,
          tools: {
            reset: true,
            zoom: " ",
            zoomin: false,
            zoomout: false,
            pan: false,
            selection: false,
            download: false,
          },
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
        colors: [secondaryColor, "#fbbf24"],
        lineCap: "square",
      },
      markers: {
        colors: [secondaryColor, "#fbbf24"],
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
        borderColor: "#44403c",
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

  const fullOptions = getOptions(highestY + 20, data.errors);

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
