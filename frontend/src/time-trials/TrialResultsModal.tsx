import { TimeBarChart } from "../charts/TimeBarChart";
import { ErrorsAtTime } from "../compiled";
import { RawStats } from "../charts/RawStats";
import { PercentileBarChart } from "../charts/PercentileBarChart";
import { Carrossel } from "../components/Carrossel";
import { WpmOverTime } from "../charts/WpmOverTimeChart";
import { Xmark } from "iconoir-react";
import React from "react";

export type Result = {
  time?: number;
  wpm?: number;
  accuracy?: number;
  percentile?: number;
  best_run_time?: number;
  best_run_wpm?: number;
  best_run_accuracy?: number;
  raw_wpm_by_second?: number[];
  wpm_by_second?: number[];
  errors_at_time?: ErrorsAtTime[];
  global_times: { [key: string]: number };
  global_wpm: { [key: number]: number };
  num_errors?: number;
  p99_time: number;
  p90_time: number;
  p50_time: number;
  p25_time: number;
  p99_wpm: number;
  p90_wpm: number;
  p50_wpm: number;
  p25_wpm: number;
};

type Props = {
  result: Result | null;
  phrase: string;
  onClose: () => void;
  shown: boolean;
};

export function TrialResultsModal(props: Props) {
  const { result: results } = props;

  const onClose = React.useCallback(() => {
    document.getElementById("type-box")?.focus();
    props.onClose();
  }, [props]);

  if (!results) {
    return null;
  }

  const views = [
    {
      id: "Performance",
      render: () => <RawStats result={results} phrase={props.phrase} />,
    },
    {
      id: "WPM Distribution",
      render: () => (
        <PercentileBarChart
          data={results.global_wpm!}
          phrase={props.phrase}
          mostRecentWpm={results.wpm!}
        />
      ),
    },
    {
      id: "Time Distribution",
      render: () => (
        <TimeBarChart
          data={results.global_times!}
          mostRecentTime={results.time!}
        />
      ),
    },
    {
      id: "Race",
      render: () => (
        <WpmOverTime
          errors={results.errors_at_time!}
          raw_wpm_by_second={results.raw_wpm_by_second!}
          wpm_by_second={results.wpm_by_second!}
        />
      ),
    },
  ];

  return (
    <div
      className="fixed backdrop-blur-xl backdrop-brightness-[.8] shadow-2xl shadow-gray-950 overflow-y-auto rounded-lg border border-base-800 left-1/2 top-1/2"
      style={{
        opacity: props.shown ? 1 : 0,
        transform: props.shown
          ? "translate(-50%, -50%)"
          : "translate(-50%, calc(-50% + 20px))",
        transition: "opacity 0.2s, transform 0.2s",
      }}
    >
      <div className="flex flex-row justify-between pl-8 p-3 w-full border-b border-base-800">
        <div className="font-semibold">Resuls</div>

        <button
          className="text-base-200 hover:text-error-color transition-colors"
          onClick={onClose}
        >
          <Xmark width={24} />
        </button>
      </div>

      <div className="p-4">
        <Carrossel views={views} />
      </div>

      <div className="flex flex-row justify-end pl-8 p-3 w-full border-b border-base-800">
        <button
          className="text-accent rounded-md px-2 py-1 font-semibold"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
