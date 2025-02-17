import { GameResult } from "@shared/types";
import { useMemo, useState, useCallback } from "react";

type Activity = {
  type: "activity";
  value: number;
  date: Date;
};

type Label = {
  type: "day" | "month";
  label: string;
};

type Blank = {
  type: "blank";
};

type Cell = Activity | Label | Blank;

type TooltipState = {
  visible: boolean;
  content: React.ReactNode;
  position: { x: number; y: number };
};

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
  data: Map<string, GameResult[]>;
  year: number;
}) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    content: null,
    position: { x: 0, y: 0 },
  });

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  const startOfYear = new Date(year, 0, 1);
  const dayOffset = startOfYear.getDay() === 0 ? 6 : startOfYear.getDay() - 1;

  const [activityGrid, maxValue] = useMemo(() => {
    let maxVal = 0;
    const vals = [
      Array.from({ length: WEEKS_IN_YEAR }, (_, i) => ({
        type: "month",
        label: MONTH_LABELS[i] || "",
      })),
      ...Array.from({ length: DAYS_IN_WEEK }, (_, dayIndex) => [
        { type: "day" as const, label: DAYS[dayIndex] },
        ...Array.from({ length: WEEKS_IN_YEAR }, (_, weekIndex) => {
          const dayNumber = weekIndex * DAYS_IN_WEEK + dayIndex - dayOffset;

          // You have 4 years to fix this.
          if (dayNumber <= 0 || dayNumber > 365) {
            return {
              type: "blank" as const,
            };
          } else {
            const date = new Date(year, 0, dayNumber);
            const value = data.get(date.toISOString())?.length ?? 0;
            if (value > maxVal) {
              maxVal = value;
            }
            const cell: Activity = {
              type: "activity" as const,
              value: value,
              date: date,
            };
            return cell;
          }
        }),
      ]),
    ];

    return [vals, maxVal] as [Cell[][], number];
  }, [data, dayOffset, year]);

  const renderCell = useCallback(
    (cell: Cell) => {
      if (cell.type === "month") {
        return (
          <div className="h-4 w-4 text-xs text-base-400">{cell.label}</div>
        );
      } else if (cell.type === "day") {
        return (
          <div className="h-4 w-full text-xs text-base-400 text-right">
            {cell.label}
          </div>
        );
      } else if (cell.type === "activity") {
        const handleMouseEnter = (e: React.MouseEvent) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const tooltipContent = (
            <div>
              <div className="font-medium">
                {cell.date.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div>
                {cell.value} {cell.value === 1 ? "game" : "games"} played
              </div>
            </div>
          );

          setTooltip({
            visible: true,
            content: tooltipContent,
            position: {
              x: rect.right + 8,
              y: rect.top + rect.height / 2,
            },
          });
        };

        return (
          <div
            className="w-4 h-4 rounded-sm hover:ring-1 hover:ring-base-200"
            onMouseEnter={handleMouseEnter}
            style={{
              backgroundColor:
                cell.value > 0 ? "var(--accent)" : "var(--base-700)",
              opacity: cell.value === 0 ? 0.25 : cell.value / maxValue,
            }}
          />
        );
      } else {
        return <div className="w-4 h-4" />;
      }
    },
    [maxValue]
  );

  return (
    <div className="w-min">
      <div className="flex flex-col gap-1">
        {activityGrid.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-row gap-1"
            style={{ marginBottom: rowIndex === 0 ? "2px" : 0 }}
            onMouseLeave={hideTooltip}
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
      <div
        className="fixed z-50 px-2 py-1 text-sm bg-base-800 text-base-100 rounded shadow-lg whitespace-nowrap pointer-events-none"
        style={{
          left: 0,
          top: 0,
          transform: `translate3d(${tooltip.position.x}px, ${tooltip.position.y}px, 0) translateY(-50%)`,
          opacity: tooltip.visible ? 0.8 : 0,
          visibility: tooltip.visible ? "visible" : "hidden",
        }}
      >
        {tooltip.content}
      </div>
    </div>
  );
}

export default GithubActivityChart;
