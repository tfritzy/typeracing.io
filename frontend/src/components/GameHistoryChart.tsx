import { useMemo } from "react";

type Props = {
  points: number[][];
  year: number;
};

const COLS = 53;
const ROWS = 16;
export function GameHistoryChart({ points: raw, year }: Props) {
  const points: number[][] = useMemo(() => {
    if (raw.length < COLS) {
      const paddingStart = Math.floor((COLS - raw.length) / 2);
      const paddingEnd = COLS - raw.length - paddingStart;
      return [
        ...Array(paddingStart).fill([]),
        ...raw,
        ...Array(paddingEnd).fill([]),
      ];
    }
    return raw;
  }, [raw]);

  const content: JSX.Element[][] = useMemo(() => {
    const squares: number[][] = [];
    for (let i = 0; i < COLS; i++) {
      squares[i] = Array(ROWS).fill(0);
    }

    let high = 0;
    for (const day of points) {
      for (const point of day) {
        if (point > high) {
          high = point;
        }
      }
    }
    high *= 1.3;

    let highestCount = 0;
    for (let day = 0; day < points.length; day++) {
      const col = Math.round((day / points.length) * (COLS - 1));
      for (const point of points[day]) {
        const row = Math.round((point / high) * ROWS);
        squares[col][row] += 1;
        if (squares[col][row] > highestCount) {
          highestCount = squares[col][row];
        }
      }
    }

    for (let x = 0; x < squares.length; x++) {
      for (let y = 0; y < squares[0].length; y++) {
        squares[x][y] = squares[x][y] / highestCount;
      }
    }

    const cols = [];

    const wpmPerRow = high / ROWS;

    const labels = [];
    for (let i = ROWS; i >= 0; i--) {
      if (i !== ROWS && i % 3 === 0) {
        labels.push(
          <div className="w-6 h-3 text-xs leading-none text-right">
            {(wpmPerRow * i).toFixed(0)}
          </div>
        );
      } else {
        labels.push(<div className="h-3" />);
      }
    }

    cols.push(labels);

    const daysPerCol = points.length / COLS;

    for (let x = 0; x < squares.length; x++) {
      const col = [];

      const week = new Date(year, 0, 7 * x);
      if (week.getDate() <= 7) {
        col.push(
          <div className="w-3 h-3 whitespace-nowrap text-xs">
            {week.toLocaleString("en-US", { month: "short" })}
          </div>
        );
      } else {
        col.push(<div className="w-3 h-3" />);
      }

      for (let y = squares[0].length - 1; y >= 0; y--) {
        col.push(
          <div
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor:
                squares[x][y] > 0 ? "var(--accent)" : "var(--base-700)",
              opacity: squares[x][y] > 0 ? squares[x][y] : 0.25,
            }}
          />
        );
      }
      cols.push(col);
    }

    return cols.map((c) => <div className="flex flex-col space-y-1">{c}</div>);
  }, [points]);

  return (
    <div className="flex flex-row items-center gap-1 text-base-500">
      {content}
    </div>
  );
}
