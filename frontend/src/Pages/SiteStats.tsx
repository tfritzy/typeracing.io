import { useEffect, useState, useMemo } from "react";
import { doc, Firestore, onSnapshot } from "firebase/firestore";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Spinner } from "../components/Spinner";

type GameCounts = Record<string, number>;
type PlayerCounts = Record<string, number>;

type DayData = {
  gameCounts: GameCounts;
  playerCounts: PlayerCounts;
  totalPlayerCount?: number;
};

type YearlyStats = {
  days: Record<string, DayData>;
};

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const SiteStats = ({ db }: { db: Firestore }) => {
  const [yearlyStats, setYearlyStats] = useState<YearlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const docRef = doc(db, "globalStats", currentYear.toString());

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setYearlyStats(doc.data() as YearlyStats);
      } else {
        setYearlyStats({ days: {} });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const chartData = useMemo(() => {
    if (!yearlyStats) return { gamesData: [], playersData: [], categories: [] };

    const sortedDayNumbers = Object.keys(yearlyStats.days)
      .map(Number)
      .sort((a, b) => a - b);
    const currentYear = new Date().getFullYear();

    const categories: string[] = [];
    const gamesData: number[] = [];
    const playersData: number[] = [];

    sortedDayNumbers.forEach((dayNumber) => {
      const dayData = yearlyStats.days[dayNumber.toString()];
      const totalGames = dayData
        ? Object.values(dayData.gameCounts).reduce(
            (sum, count) => sum + count,
            0
          )
        : 0;
      const totalPlayers =
        dayData?.totalPlayerCount ||
        (dayData
          ? Object.values(dayData.playerCounts).reduce(
              (sum, count) => sum + count,
              0
            )
          : 0);

      const date = new Date(currentYear, 0, dayNumber);
      const label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      categories.push(label);
      gamesData.push(totalGames);
      playersData.push(totalPlayers);
    });

    return { gamesData, playersData, categories };
  }, [yearlyStats]);

  const gamesChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      background: "transparent",
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "95%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      tickAmount: 12,
      categories: chartData.categories,
      labels: {
        style: {
          colors: "var(--base-400)",
        },
        rotate: -45,
        rotateAlways: true,
      },
      axisBorder: {
        color: "var(--base-600)",
      },
      axisTicks: {
        color: "var(--base-600)",
      },
    },
    yaxis: {
      title: {
        text: "Games",
        style: {
          color: "var(--base-400)",
        },
      },
      labels: {
        style: {
          colors: "var(--base-400)",
        },
        formatter: (val: number) => formatNumber(val),
      },
    },
    fill: {
      colors: ["var(--accent)"],
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number) => formatNumber(val) + " games",
      },
    },
    grid: {
      borderColor: "var(--base-700)",
      strokeDashArray: 3,
    },
    theme: {
      mode: "dark",
    },
  };

  const playersChartOptions: ApexOptions = {
    ...gamesChartOptions,
    yaxis: {
      title: {
        text: "Players",
        style: {
          color: "var(--base-400)",
        },
      },
      labels: {
        style: {
          colors: "var(--base-400)",
        },
        formatter: (val: number) => formatNumber(val),
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number) => formatNumber(val) + " players",
      },
    },
  };

  if (loading) {
    return <Spinner />;
  }

  if (!yearlyStats) {
    return <div className="text-base-400">No stats available</div>;
  }

  const totalGames = chartData.gamesData.reduce((sum, count) => sum + count, 0);
  const totalPlayers = chartData.playersData.reduce(
    (sum, count) => sum + count,
    0
  );
  const avgGamesPerDay =
    chartData.gamesData.length > 0
      ? Math.round(totalGames / chartData.gamesData.length)
      : 0;
  const avgPlayersPerDay =
    chartData.playersData.length > 0
      ? Math.round(totalPlayers / chartData.playersData.length)
      : 0;

  return (
    <div className="py-8 w-[90%] flex flex-col space-y-8">
      <h1>Site Statistics</h1>

      <div className="space-y-8">
        <div className="space-y-4">
          <div>Games Per Day ({new Date().getFullYear()})</div>
          <div className="border border-base-700 rounded-lg p-4 bg-base-800">
            <Chart
              options={gamesChartOptions}
              series={[
                {
                  name: "Games",
                  data: chartData.gamesData,
                },
              ]}
              type="bar"
              height={350}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>Players Per Day ({new Date().getFullYear()})</div>
          <div className="border border-base-700 rounded-lg p-4 bg-base-800">
            <Chart
              options={playersChartOptions}
              series={[
                {
                  name: "Players",
                  data: chartData.playersData,
                },
              ]}
              type="bar"
              height={350}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-base-700 rounded-lg p-4 text-center">
          <div className="text-2xl text-accent">{formatNumber(totalGames)}</div>
          <div className="text-base-400">Total Games</div>
        </div>
        <div className="border border-base-700 rounded-lg p-4 text-center">
          <div className="text-2xl text-accent">
            {formatNumber(totalPlayers)}
          </div>
          <div className="text-base-400">Total Players</div>
        </div>
        <div className="border border-base-700 rounded-lg p-4 text-center">
          <div className="text-2xl text-accent">
            {formatNumber(avgGamesPerDay)}
          </div>
          <div className="text-base-400">Avg Games/Day</div>
        </div>
        <div className="border border-base-700 rounded-lg p-4 text-center">
          <div className="text-2xl text-accent">
            {formatNumber(avgPlayersPerDay)}
          </div>
          <div className="text-base-400">Avg Players/Day</div>
        </div>
      </div>
    </div>
  );
};
