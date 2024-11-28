import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface Props {
  phrase: string;
  data: { [key: number]: number };
  mostRecentWpm: number;
}

export const PercentileBarChart: React.FC<Props> = ({
  data,
  phrase,
  mostRecentWpm,
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

    for (let i = min - 5; i < max + 5; i++) {
      const wpm = i;
      const percent = (((data[i] ?? 0) / totalCount) * 100).toFixed(0) + "%";
      filledIn[wpm] = percent;
    }

    return filledIn;
  }, [data]);

  const series: ApexOptions["series"] = React.useMemo(() => {
    const closestWpm = Object.keys(data)
      .map(Number)
      .reduce((closest, key) => {
        const currentDiff = Math.abs(key - mostRecentWpm);
        const closestDiff = Math.abs(closest - mostRecentWpm);
        return currentDiff < closestDiff ? key : closest;
      });

    console.log(mostRecentWpm, closestWpm, data);

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
  }, [data, formattedData, mostRecentWpm]);

  console.log(series);

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
        selection: {
          enabled: true,
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
        enabled: false,
      },
    };

    return opts;
  }, []);

  return (
    <div className="w-full">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
};
