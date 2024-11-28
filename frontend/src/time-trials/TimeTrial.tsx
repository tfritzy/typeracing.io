import React from "react";
import { useParams } from "react-router-dom";
import { TimeTrialTypeBox } from "./TimeTrialTypeBox";
import {
  decodeReportTimeTrialResponse,
  decodeTimeTrial,
  encodeReportTimeTrialRequest,
  KeyStroke,
  ReportTimeTrialResponse,
} from "../compiled";
import type { TimeTrial as TimeTrialData } from "../compiled";
import { useAppSelector } from "../store/storeHooks";
import { PlayerState } from "../store/playerSlice";
import { RootState } from "../store/store";
import { Result, TrialResultsModal } from "./TrialResultsModal";
import { Hotkey } from "../components/Hotkey";

const apiUrl = process.env.REACT_APP_API_ADDRESS;

type ResolvedTimeTrial = {
  id: string;
  name: string;
  phrase: string;
  global_wpm: { [key: number]: number };
};

function parseTimeTrial(trial: TimeTrialData): ResolvedTimeTrial | null {
  if (!trial.id || !trial.name || !trial.phrase || !trial.global_wpm) {
    return null;
  }

  return {
    global_wpm: trial.global_wpm,
    id: trial.id,
    name: trial.name,
    phrase: trial.phrase,
  };
}

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

export function TimeTrial() {
  const player: PlayerState = useAppSelector(
    (state: RootState) => state.player
  );
  const params = useParams();
  const [trial, setTrial] = React.useState<TimeTrialData | undefined>(
    undefined
  );
  const [results, setResults] = React.useState<Result | null>(null);
  const [resultsOpen, setResultsOpen] = React.useState<boolean>(false);
  const [errored, setErrored] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!params.id) {
      return;
    }

    fetch(apiUrl + `/api/time-trial?id=${params.id}`)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => new Uint8Array(arrayBuffer))
      .then((data) => {
        const decoded = parseTimeTrial(decodeTimeTrial(data));

        if (decoded !== null) {
          setTrial(decoded);
        } else {
          setErrored(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [params.id]);

  const postResult = React.useCallback(
    (keystrokes: KeyStroke[]) => {
      const opts = {
        method: "POST",
        headers: { "X-Player-Id": player.id, "X-Auth-Token": player.token },
        body: encodeReportTimeTrialRequest({
          id: trial?.id,
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
            setResults(result);
            setResultsOpen(true);
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

  console.log("results", results);

  if (errored) {
    return <div className="grow">Womp womp</div>;
  }

  if (!trial) {
    return <div className="grow"></div>;
  }

  return (
    <>
      <div className="grow flex flex-col justify-center">
        <div className="grow" />
        <div className="grow flex flex-col justify-center">
          <TimeTrialTypeBox trial={trial} onPhraseComplete={postResult} />
        </div>

        <div className="flex flex-col items-center justify-center grow">
          <div className="flex flex-row rounded-full px-3 bg-base-900 border border-base-700 shadow-sm shadow-shadow-color text-base-300">
            <div className="flex flex-row items-center space-x-2 p-2">
              <span>Time trials</span>
              <Hotkey code="t" />
            </div>

            <div className="h-6 m-auto border-r ml-1 mr-1 py-3 border-base-700" />

            <div className="flex flex-row items-center space-x-2 p-2">
              <span>View stats</span>
              <Hotkey code="s" />
            </div>
          </div>
        </div>
      </div>

      <TrialResultsModal
        result={results}
        phrase={trial.phrase!}
        onClose={() => setResultsOpen(false)}
        shown={resultsOpen && !!results}
      />
    </>
  );
}
