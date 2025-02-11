import { useMemo } from "react";

type Props = {
  points: number[][];
};

const COLS = 60;
const ROWS = 20;
export function GameHistoryChart({ points: raw }: Props) {
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

  console.log("points", points);

  const content: JSX.Element[][] = useMemo(() => {
    const squares: number[][] = [];
    for (let i = 0; i < 60; i++) {
      squares[i] = Array(20).fill(0);
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
      console.log(day, points.length);
      const col = Math.round((day / points.length) * COLS);
      for (const point of points[day]) {
        const row = Math.round((point / high) * ROWS);
        console.log("colrow", col, row);
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

    console.log(squares);

    const cols = [];
    for (let x = 0; x < squares.length; x++) {
      const col = [];
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

  return <div className="flex flex-row gap-1">{content}</div>;
}
