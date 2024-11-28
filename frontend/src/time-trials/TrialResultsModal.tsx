import { TimeBarChart } from "../charts/TimeBarChart";
import {
  decodeReportTimeTrialResponse,
  encodeReportTimeTrialRequest,
  ErrorsAtTime,
  KeyStroke,
  ReportTimeTrialResponse,
} from "../compiled";
import { RawStats } from "../charts/RawStats";
import { PercentileBarChart } from "../charts/PercentileBarChart";
import { Carrossel } from "../components/Carrossel";
import { WpmOverTime } from "../charts/WpmOverTimeChart";
import { Xmark } from "iconoir-react";
import React from "react";
import { PlayerState } from "../store/playerSlice";
import { RootState } from "../store/store";
import { useAppSelector } from "../store/storeHooks";

type Result = {
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

function parseTimeTrialResult(
  response: ReportTimeTrialResponse
): Result | null {
  if (
    !response.errors_at_time ||
    !response.global_times ||
    !response.global_wpm
  ) {
    console.log("rejecting", response);
    return null;
  }

  return {
    time: response.time || undefined,
    wpm: response.wpm || undefined,
    accuracy: response.accuracy || undefined,
    best_run_time: response.best_run_time || undefined,
    best_run_wpm: response.best_run_wpm || undefined,
    best_run_accuracy: response.best_run_accuracy || undefined,
    raw_wpm_by_second: response.raw_wpm_by_second,
    wpm_by_second: response.wpm_by_second || undefined,
    errors_at_time: response.errors_at_time,
    global_times: response.global_times,
    global_wpm: response.global_wpm,
    num_errors: response.num_errors || undefined,
    p99_time: response.p99_time || 0,
    p90_time: response.p90_time || 0,
    p50_time: response.p50_time || 0,
    p25_time: response.p25_time || 0,
    p99_wpm: response.p99_wpm || 0,
    p90_wpm: response.p90_wpm || 0,
    p50_wpm: response.p50_wpm || 0,
    p25_wpm: response.p25_wpm || 0,
    percentile: response.percentile || undefined,
  };
}

type Props = {
  trialId: string;
  keystrokes: KeyStroke[];
  phrase: string;
  onClose: () => void;
  shown: boolean;
};

export function TrialResultsModal(props: Props) {
  const player: PlayerState = useAppSelector(
    (state: RootState) => state.player
  );
  const [errored, setErrored] = React.useState<boolean>(false);
  const [result, setResult] = React.useState<Result | null>(null);
  const onClose = React.useCallback(() => {
    document.getElementById("type-box")?.focus();
    props.onClose();
  }, [props]);

  const postResult = React.useCallback(
    (keystrokes: KeyStroke[]) => {
      const opts = {
        method: "POST",
        headers: { "X-Player-Id": player.id, "X-Auth-Token": player.token },
        body: encodeReportTimeTrialRequest({
          id: props.trialId,
          keystrokes: keystrokes,
        }),
      };
      fetch(apiUrl + "/api/time-trial-result", opts)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => new Uint8Array(arrayBuffer))
        .then((data) => {
          const decoded = decodeReportTimeTrialResponse(data);
          const result = parseTimeTrialResult(decoded);

          if (result !== null) {
            setResult(result);
          } else {
            setErrored(true);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    [player.id, player.token, trial?.id]
  );

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
