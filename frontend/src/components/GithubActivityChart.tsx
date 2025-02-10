import { useMemo } from "react";

type Activity = {
  type: "activity";
  value: number;
  dayIndex: number;
};

type Label = {
  type: "day" | "month";
  label: string;
};

type Blank = {
  type: "blank";
};

type Cell = Activity | Label | Blank;

const WEEKS_IN_YEAR = 53;
const DAYS_IN_WEEK = 7;
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
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

export function GithubActivityChart({
  data,
  year,
}: {
  data: number[];
  year: number;
}) {
  const startOfYear = new Date(year, 0, 1);
  const dayOffset = startOfYear.getDay() === 0 ? 6 : startOfYear.getDay() - 1;
  const lastDay = new Date(year, 11, 31).getDayOfYear();
  console.log(dayOffset, lastDay);

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
          console.log(dayNumber);
          if (dayNumber <= dayOffset || dayNumber > 365 + dayOffset) {
            return {
              type: "blank",
            };
          } else {
            return {
              type: "activity" as const,
              value: data[dayNumber] ?? 0,
              dayIndex: dayNumber,
            };
          }
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
      return (
        <div
          className="w-3 h-3 rounded-sm"
          title={`${cell.value} activities on ${cell.dayIndex}`}
          style={{
            backgroundColor:
              cell.value > 0 ? "var(--accent)" : "var(--base-700)",
            opacity: cell.value === 0 ? 0.25 : 1,
          }}
        />
      );
    } else {
      return <div className="w-3 h-3" />;
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
