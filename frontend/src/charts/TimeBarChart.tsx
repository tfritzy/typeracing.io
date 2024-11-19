import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface Props {
  data: { [key: number]: number };
}

export const TimeBarChart: React.FC<Props> = ({ data }) => {
  const formattedData: { [key: number]: string } = React.useMemo(() => {
    if (Object.keys(data).length === 0) {
      return {};
    }

    const filledIn: { [key: number]: string } = {};
    const max = Object.keys(data)
      .map(Number)
      .reduce((max, val) => Math.max(max, val));
    const totalCount = Object.values(data)
      .map(Number)
      .reduce((sum, val) => sum + val);

    for (let i = 1; i < max + 3; i++) {
      const percent = (((data[i] ?? 0) / totalCount) * 100).toFixed(0) + "%";
      filledIn[i] = percent;
    }

    return filledIn;
  }, [data]);

  const series: ApexOptions["series"] = React.useMemo(() => {
    const ser: ApexAxisChartSeries = [
      {
        name: "Value",
        data: Object.keys(formattedData)
          .map(Number)
          .map((wpm) => ({
            x: wpm,
            y: formattedData[wpm],
            fillColor: "var(--base-600)",
          }))
          .sort((a, b) => a.x - b.x),
      },
    ];
    return ser;
  }, [formattedData]);

  console.log(series);

  const options: ApexOptions = React.useMemo(() => {
    const opts: ApexOptions = {
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
        selection: {
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
        sorted: true,
        title: {
          text: "Time (seconds)",
          style: {
            color: "var(--base-300)",
          },
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
        height={300}
      />
    </div>
  );
};
