import React from "react";
import { Modal } from "./components/Modal";
import { WpmOverTime } from "./components/WpmOverTimeChart";
import {
  calculateAccuracy,
  getAggWpmBySecond,
  getErrorCount,
  getErrorCountByTime,
  getRawWpmBySecond,
  getTime,
  getWpm,
  KeyStroke,
} from "./stats";
import { placeToString } from "./helpers";
import { Confettii } from "./components/Confettii";

type Props = {
  shown: boolean;
  onClose: () => void;
  keystrokes: KeyStroke[];
  phrase: string;
  place: number;
};

export function StatsModal(props: Props) {
  const data = React.useMemo(() => {
    if (!props.keystrokes.length) {
      return undefined;
    }

    return {
      wpm: getWpm(props.keystrokes),
      time: getTime(props.keystrokes),
      accuracy: calculateAccuracy(props.keystrokes, props.phrase),
      wpm_by_second: getRawWpmBySecond(props.keystrokes),
      raw_wpm_by_second: getAggWpmBySecond(props.keystrokes),
      errors: getErrorCountByTime(props.keystrokes, props.phrase),
      errorCount: getErrorCount(props.keystrokes, props.phrase),
    };
  }, [props.keystrokes, props.phrase]);

  if (!data) {
    return null;
  }

  return (
    <>
      <Modal
        title="Finish!"
        shown={props.shown}
        onClose={props.onClose}
        betweenChildren={props.place === 0 ? <Confettii /> : undefined}
      >
        <div className="px-2 pt-4">
          <div className="flex flex-row space-x-3 items-center mb-2 pl-4">
            <Box
              name="Place"
              gold={props.place === 0}
              value={placeToString(props.place)}
              key="place"
            />
            <Box
              name="WPM"
              gold={data.wpm >= 100}
              value={data.wpm.toFixed(1)}
              key="wpm"
            />
            <Box
              name="Accuracy"
              gold={data.accuracy >= 1}
              value={`${(data.accuracy * 100).toFixed(0)}%`}
              key="accuracy"
            />
            <div className="w-[1px] h-12 bg-base-600" />
            <SmolBox name="Time" value={`${data.time}s`} />
            <SmolBox name="Errors" value={data.errorCount.toString()} />
            <SmolBox name="Words" value={`${props.phrase.split(" ").length}`} />
            <SmolBox
              name="char/s"
              value={`${(props.phrase.length / data.time).toFixed(2)}`}
            />
          </div>
          <div className="">
            <WpmOverTime
              raw_wpm_by_second={data.raw_wpm_by_second}
              wpm_by_second={data.wpm_by_second}
              errors={data.errors}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

function Box({
  name,
  value,
  gold,
}: {
  name: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div
      className={"border border-b-[3px] rounded px-4 py-2 min-w-20"}
      style={{ borderColor: gold ? "var(--accent)" : "var(--base-600)" }}
    >
      <div
        className="text-xs text-accent uppercase mb-1"
        style={{ color: gold ? "var(--accent)" : "var(--base-400)" }}
      >
        {name}
      </div>
      <div
        className="text-2xl"
        style={{ color: gold ? "var(--accent)" : "var(--base-300)" }}
      >
        {value}
      </div>
    </div>
  );
}

function SmolBox({ name, value }: { name: string; value: string }) {
  return (
    <div className="border border-b-2 border-base-600 rounded px-4 py-2 h-min">
      <div className="text-xs uppercase text-start text-base-400">{name}</div>
      <div className="text-lg text-base-300">{value}</div>
    </div>
  );
}
