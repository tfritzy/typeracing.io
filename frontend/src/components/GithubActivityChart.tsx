import { useMemo } from "react";

type Activity = {
  type: "activity";
  value: number;
};

type Label = {
  type: "day" | "month";
  label: string;
};

type Cell = Activity | Label;

export function generateMockData(options = {}) {
  const {
    maxDaily = 12,
    activeDaysPercent = 30,
    streakProbability = 0.7,
  } = options;
  const data = new Array(366).fill(0);
  let isInStreak = false;
  for (let i = 0; i < data.length; i++) {
    const shouldHaveActivity = Math.random() * 100 < activeDaysPercent;
    if (isInStreak && Math.random() < streakProbability) {
      data[i] = Math.floor(Math.random() * maxDaily) + 1;
      continue;
    }
    if (shouldHaveActivity) {
      data[i] = Math.floor(Math.random() * maxDaily) + 1;
      isInStreak = true;
    } else {
      data[i] = 0;
      isInStreak = false;
    }
  }
  return data;
}

const WEEKS_IN_YEAR = 53;
const DAYS_IN_WEEK = 7;
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const COLORS = ["hsl(47, 0%, 18%)", "var(--accent)"];
const MONTH_LABELS: { [week: number]: string } = {
  1: "Jan",
  5: "Feb",
  9: "Mar",
  14: "Apr",
  18: "May",
  23: "Jun",
  27: "Jul",
  31: "Aug",
  36: "Sep",
  40: "Oct",
  44: "Nov",
  49: "Dec",
};

export function GithubActivityChart({ data }: { data: number[] }) {
  const p90 = useMemo(() => {
    const sortedData = [...data].sort((a, b) => a - b).filter((a) => a);
    const index = Math.floor(sortedData.length * 0.9);
    return sortedData[index];
  }, [data]);

  const activityGrid: Cell[][] = useMemo(
    () => [
      Array.from({ length: WEEKS_IN_YEAR }, (_, i) => ({
        type: "month",
        label: MONTH_LABELS[i] || "",
      })),
      ...Array.from({ length: DAYS_IN_WEEK }, (_, dayIndex) => [
        { type: "day" as const, label: DAYS[dayIndex] },
        ...Array.from({ length: WEEKS_IN_YEAR }, (_, weekIndex) => {
          const dayNumber = weekIndex * DAYS_IN_WEEK + dayIndex;
          return {
            type: "activity" as const,
            value: data[dayNumber] ?? 0,
          };
        }),
      ]),
    ],
    [data]
  );

  const renderCell = (cell: Cell) => {
    if (cell.type === "month") {
      return <div className="h-3 w-3 text-xs text-base-400">{cell.label}</div>;
    } else if (cell.type === "day") {
      return (
        <div className="h-3 w-full text-xs text-base-400 text-right">
          {cell.label}
        </div>
      );
    } else if (cell.type === "activity") {
      const color =
        COLORS[
          Math.max(0, Math.floor((cell.value / p90) * (COLORS.length - 1)))
        ];

      return (
        <div
          className="w-3 h-3 rounded-sm"
          title={`${cell.value} activities`}
          style={{
            backgroundColor: color,
          }}
        />
      );
    }
  };

  return (
    <div className="w-min">
      <div className="flex flex-col gap-1">
        {activityGrid.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-row gap-1"
            style={{ marginBottom: rowIndex === 0 ? "2px" : 0 }}
          >
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                style={{ width: cellIndex === 0 ? "24px" : "" }}
              >
                {renderCell(cell)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
