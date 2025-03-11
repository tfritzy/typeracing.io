import React from "react";
import { WpmOverTime } from "./WpmOverTimeChart";
import {
  calculateAccuracy,
  getAggWpmBySecond,
  getErrorCount,
  getErrorCountByTime,
  getRawWpmBySecond,
  getTime,
  getWpm,
  KeyStroke,
} from "../stats";
import { placeToString } from "../helpers";
import { ModeType } from "@shared/types";
import { Confettii } from "./Confettii";

type Props = {
  keystrokes: KeyStroke[];
  phrase: string;
  place: number;
  mode: ModeType;
};

export function Stats(props: Props) {
  const data = React.useMemo(() => {
    if (!props.keystrokes.length) {
      return undefined;
    }

    const raw = getRawWpmBySecond(props.keystrokes);
    return {
      wpm: getWpm(props.keystrokes),
      time: getTime(props.keystrokes),
      accuracy: calculateAccuracy(props.keystrokes, props.phrase),
      wpm_by_second: getAggWpmBySecond(props.keystrokes),
      raw_wpm_by_second: raw,
      errors: getErrorCountByTime(props.keystrokes, props.phrase),
      errorCount: getErrorCount(props.keystrokes, props.phrase),
    };
  }, [props.keystrokes, props.phrase]);

  return (
    <div className="">
      {props.place === 0 && <Confettii />}
      <div className="border rounded-lg border-base-700">
        <div className="flex flex-row space-x-3 items-center mb-2 border-b border-base-700 p-4 bg-base-900">
          <Box
            name="Place"
            gold={props.place === 0}
            value={placeToString(props.place)}
            key="place"
          />
          <Box
            name="WPM"
            gold={data && data.wpm >= 100}
            value={data?.wpm.toFixed(1)}
            key="wpm"
          />
          <Box
            name="Accuracy"
            gold={data && data.accuracy >= 1}
            value={data && `${(data.accuracy * 100).toFixed(0)}%`}
            key="accuracy"
          />
          <div className="w-[1px] h-12 bg-base-600" />
          <SmolBox name="Time" value={data && `${data.time}s`} />
          <SmolBox name="Errors" value={data && data.errorCount.toString()} />
          <SmolBox name="Words" value={`${props.phrase.split(" ").length}`} />
          <SmolBox
            name="char/s"
            value={data && `${(props.phrase.length / data.time).toFixed(2)}`}
          />
        </div>
        <div className="px-4 py-1">
          {data ? (
            <WpmOverTime
              raw_wpm_by_second={data.raw_wpm_by_second}
              wpm_by_second={data.wpm_by_second}
              errors={data.errors}
            />
          ) : (
            <div className="h-[300px]" />
          )}
        </div>
      </div>
    </div>
  );
}

function Box({
  name,
  value,
  gold,
}: {
  name: string;
  value: string | undefined;
  gold?: boolean;
}) {
  return (
    <div
      className="border rounded-xl min-w-20 text-center"
      style={{ borderColor: gold ? "var(--accent)" : "var(--base-600)" }}
    >
      <div
        className="border-b-[5px] px-4 py-2 rounded-xl"
        style={{ borderColor: gold ? "var(--accent)" : "var(--base-600)" }}
      >
        <div
          className="text-xs text-accent uppercase"
          style={{ color: gold ? "var(--accent)" : "var(--base-400)" }}
        >
          {name}
        </div>
        <div
          className="text-2xl"
          style={{ color: gold ? "var(--accent)" : "var(--base-300)" }}
        >
          {value === undefined ? "-" : value}
        </div>
      </div>
    </div>
  );
}

function SmolBox({ name, value }: { name: string; value: string | undefined }) {
  return (
    <div className="border border-base-700 rounded-lg px-4 py-2 h-min text-center">
      <div className="text-xs uppercase text-start text-base-400">{name}</div>
      <div className="text-lg text-base-300">
        {value === undefined ? "-" : value}
      </div>
    </div>
  );
}
