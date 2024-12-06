import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface Props {
  phrase: string;
  data: { [key: number]: number };
  mostRecentWpm: number;
  percentile: number;
}

export const PercentileBarChart: React.FC<Props> = ({
  data,
  phrase,
  mostRecentWpm,
  percentile,
}) => {
  const formattedData: { [key: number]: string } = React.useMemo(() => {
    if (Object.keys(data).length === 0) {
      return {};
    }

    const filledIn: { [key: number]: string } = {};
    const min = Object.keys(data)
      .map(Number)
      .reduce((min, val) => Math.min(min, val));
    const max = Object.keys(data)
      .map(Number)
      .reduce((max, val) => Math.max(max, val));
    const totalCount = Object.values(data)
      .map(Number)
      .reduce((sum, val) => sum + val);
    const stepSize = Math.max(Math.floor((max + 10 - min - 10) / 30), 1);

    for (let i = min - 10; i < max + 10; i += stepSize) {
      let count = 0;

      for (let j = i; j < i + stepSize; j++) {
        count += data[j] ?? 0;
      }

      const wpm = i;
      const percent = !!count
        ? ((count / totalCount) * 100).toFixed(0) + "%"
        : "0%";
      filledIn[wpm] = percent;
    }

    return filledIn;
  }, [data]);

  const series: ApexOptions["series"] = React.useMemo(() => {
    const closestWpm = Object.keys(formattedData)
      .map(Number)
      .filter((wpm) => formattedData[wpm] !== "0%")
      .sort(
        (a, b) => Math.abs(a - mostRecentWpm) - Math.abs(b - mostRecentWpm)
      )[0];

    const ser: ApexAxisChartSeries = [
      {
        name: "Value",
        data: Object.keys(formattedData)
          .map(Number)
          .map((wpm) => ({
            x: wpm,
            y: formattedData[wpm],
            fillColor: wpm === closestWpm ? "var(--accent)" : "var(--base-500)",
          }))
          .sort((a, b) => b.x - a.x),
      },
    ];
    return ser;
  }, [formattedData, mostRecentWpm]);

  const options: ApexOptions = React.useMemo(() => {
    const opts: ApexOptions = {
      chart: {
        type: "bar",
        zoom: {
          enabled: true,
          type: "x",
        },
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
        sorted: false,
        title: {
          text: "WPM",
          style: {
            color: "var(--base-300)",
          },
          offsetY: 4,
        },
        labels: {
          style: {
            colors: "var(--base-300)",
          },
        },
        type: "category",
      },
      yaxis: {
        tickAmount: 5,
        labels: {
          formatter: (val) => val + "%",
          style: {
            colors: "var(--base-300)",
          },
        },
      },
      tooltip: {
        enabled: true,
        marker: {
          show: false, // Hide the marker dot
        },
        y: {
          formatter: (val) => val + "% of players", // Format the percentage
          title: {
            formatter: () => "", // Remove the "Value" prefix
          },
        },
        x: {
          formatter: (val) => val + " WPM",
        },
        shared: true,
        intersect: false,
        custom: undefined,
        theme: "dark",
        style: {
          fontSize: "12px",
        },
      },
    };

    return opts;
  }, []);

  return (
    <div className="w-full">
      <div className="pl-4">
        <span>Completed with </span>
        <span className="font-bold text-accent">
          {mostRecentWpm?.toFixed(1)}
        </span>
        <span> wpm. You did better than </span>
        <span className="font-bold text-accent">
          {((percentile || 0) * 100)?.toFixed(1)}%
        </span>
        <span> of players.</span>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
};
