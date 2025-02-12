import { GameResult } from "@shared/types";
import { useMemo, useState, useCallback } from "react";
import { getWeek } from "../helpers/dateHelpers";

type Props = {
  data: Map<string, GameResult[]>;
  year: number;
};

type TooltipState = {
  visible: boolean;
  content: React.ReactNode;
  position: { x: number; y: number };
};

const COLS = 53;
const ROWS = 16;

function Square({
  opacity,
  hasData,
  onMouseEnter,
}: {
  opacity: number;
  hasData: boolean;
  onMouseEnter: (e: React.MouseEvent) => void;
  tooltipContent: React.ReactNode;
}) {
  return (
    <div className="p-[2px]" onMouseEnter={onMouseEnter}>
      <div
        className="w-3 h-3 rounded-sm hover:ring-1 hover:ring-accent/50 transition-all duration-100"
        style={{
          backgroundColor: hasData ? "var(--accent)" : "var(--base-700)",
          opacity: hasData ? opacity : 0.25,
        }}
      />
    </div>
  );
}

export function GameHistoryChart({ data, year }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    content: null,
    position: { x: 0, y: 0 },
  });

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  const timestamps = useMemo(() => {
    return Array.from(data.keys()).sort();
  }, [data]);

  const weeklyPoints = useMemo(() => {
    const points: number[][] = Array(COLS)
      .fill(null)
      .map(() => []);
    for (const timestamp of timestamps) {
      const date = new Date(timestamp);
      const weekIndex = getWeek(date);
      const results = data.get(timestamp) || [];
      results.forEach((r) => {
        points[weekIndex].push(r.wpm);
      });
    }
    return points;
  }, [data, timestamps]);

  const { squares, counts, wpmPerRow } = useMemo(() => {
    const squares: number[][] = Array(COLS)
      .fill(null)
      .map(() => Array(ROWS).fill(0));
    const counts: number[][] = Array(COLS)
      .fill(null)
      .map(() => Array(ROWS).fill(0));

    let high = 0;
    let highestCount = 0;

    weeklyPoints.forEach((day) => {
      day.forEach((point) => {
        high = Math.max(high, point);
      });
    });

    high *= 1.3;
    const wpmPerRow = high / ROWS;

    // Second pass to fill squares and counts
    weeklyPoints.forEach((day, dayIndex) => {
      const col = Math.round((dayIndex / weeklyPoints.length) * (COLS - 1));
      day.forEach((point) => {
        const row = Math.round((point / high) * ROWS);
        squares[col][row] += 1;
        counts[col][row] += 1;
        highestCount = Math.max(highestCount, squares[col][row]);
      });
    });

    // Normalize squares
    squares.forEach((col, x) => {
      col.forEach((_, y) => {
        squares[x][y] = squares[x][y] / highestCount;
      });
    });

    return { squares, counts, wpmPerRow, high };
  }, [weeklyPoints]);

  const renderSquare = useCallback(
    (x: number, y: number, week: Date) => {
      const wpmLow = (y * wpmPerRow).toFixed(0);
      const wpmHigh = ((y + 1) * wpmPerRow).toFixed(0);
      const count = counts[x][y];
      const hasData = squares[x][y] > 0;

      const tooltipContent = (
        <div>
          <div className="font-medium">
            Week of{" "}
            {week.toLocaleString("en-US", { month: "short", day: "numeric" })}
          </div>

          <div>
            {wpmLow} - {wpmHigh} WPM
          </div>

          <div>
            {count} {count === 1 ? "game" : "games"}
          </div>
        </div>
      );

      const handleMouseEnter = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
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
        <Square
          key={`square-${x}-${y}`}
          opacity={squares[x][y]}
          hasData={hasData}
          onMouseEnter={handleMouseEnter}
          tooltipContent={tooltipContent}
        />
      );
    },
    [squares, counts, wpmPerRow, setTooltip]
  );

  const content = useMemo(() => {
    const cols = [];

    // Labels column
    const labels = [];
    for (let i = ROWS; i >= 0; i--) {
      if (i !== ROWS && i % 3 === 0) {
        labels.push(
          <div
            key={`label-${i}`}
            className="w-6 h-3 text-xs leading-none text-right mb-1 mr-1"
          >
            {(wpmPerRow * i).toFixed(0)}
          </div>
        );
      } else {
        labels.push(<div key={`label-${i}`} className="h-3 mb-1 mr-1" />);
      }
    }
    cols.push(labels);

    // Data columns
    for (let x = 0; x < squares.length; x++) {
      const col = [];
      const week = new Date(year, 0, 1 + 7 * x);
      const nextWeek = new Date(year, 0, 1 + 7 * (x + 1));
      const crossesBound = week.getMonth() != nextWeek.getMonth();

      if (crossesBound || getWeek(week) === 1) {
        col.push(
          <div
            key={`month-${x}`}
            className="w-3 h-3 whitespace-nowrap text-xs mb-1"
          >
            {nextWeek.toLocaleString("en-US", { month: "short" })}
          </div>
        );
      } else {
        col.push(<div key={`month-${x}`} className="w-3 h-3 mb-1" />);
      }

      for (let y = squares[0].length - 1; y >= 0; y--) {
        col.push(renderSquare(x, y, week));
      }
      cols.push(col);
    }

    return cols.map((c, i) => (
      <div
        key={`col-${i}`}
        className="flex flex-col"
        onMouseLeave={hideTooltip}
      >
        {c}
      </div>
    ));
  }, [squares, wpmPerRow, year, renderSquare, hideTooltip]);

  return (
    <div className="flex flex-row items-center text-base-500 ">
      {content}
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
