import {
  decodeReportTimeTrialResponse,
  encodeReportTimeTrialRequest,
  ErrorsAtTime,
  KeyStroke,
  ReportTimeTrialResponse,
} from "../compiled";
import { RawStats } from "../charts/RawStats";
import { PercentileBarChart } from "../charts/PercentileBarChart";
import { WpmOverTime } from "../charts/WpmOverTimeChart";
import { WifiXmark } from "iconoir-react";
import React from "react";
import { PlayerState } from "../store/playerSlice";
import { RootState } from "../store/store";
import { useAppSelector } from "../store/storeHooks";
import { Spinner } from "../components/Spinner";
import { Button } from "../components/Button";
import { ActionBar } from "../components/ActionBar";
import { useNavigate } from "react-router-dom";
import { Carrossel } from "../components/Carrossel";

const apiUrl = process.env.REACT_APP_API_ADDRESS;

export type ResolvedTimeTrialResult = {
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
): ResolvedTimeTrialResult | null {
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

export function TrialResults(props: Props) {
  const player: PlayerState = useAppSelector(
    (state: RootState) => state.player
  );
  const [errored, setErrored] = React.useState<boolean>(false);
  const [result, setResult] = React.useState<ResolvedTimeTrialResult | null>(
    null
  );
  const [pending, setPending] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const onClose = React.useCallback(
    (event: Event) => {
      event.preventDefault();
      props.onClose();
      document.getElementById("type-box")?.focus();
    },
    [props]
  );

  const returnToTimeTrials = React.useCallback(() => {
    navigate("/time-trials");
  }, [navigate]);

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
      setPending(true);
      fetch(apiUrl + "/api/time-trial-result", opts)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => new Uint8Array(arrayBuffer))
        .then((data) => {
          const decoded = decodeReportTimeTrialResponse(data);
          const result = parseTimeTrialResult(decoded);

          if (result !== null) {
            setErrored(false);
            setResult(result);
          } else {
            setErrored(true);
          }

          setPending(false);
        })
        .catch((error) => {
          setPending(false);
          setErrored(true);
        });
    },
    [player.id, player.token, props.trialId]
  );

  React.useEffect(() => {
    if (props.keystrokes.length) {
      postResult(props.keystrokes);
    }
  }, [postResult, props.keystrokes]);

  const views = React.useMemo(() => {
    if (!result) {
      return [];
    }

    return [
      {
        id: "Distribution",
        render: () => (
          <PercentileBarChart
            data={result.global_wpm!}
            phrase={props.phrase}
            mostRecentWpm={result.wpm!}
            percentile={result.percentile!}
          />
        ),
      },
      {
        id: "Stats",
        render: () => <RawStats result={result} phrase={props.phrase} />,
      },
      {
        id: "Race",
        render: () => (
          <WpmOverTime
            errors={result.errors_at_time!}
            raw_wpm_by_second={result.raw_wpm_by_second!}
            wpm_by_second={result.wpm_by_second!}
          />
        ),
      },
    ];
  }, [props.phrase, result]);

  const actionBarOptions = [
    {
      name: "Time trials",
      hotkey: "t",
      onPress: returnToTimeTrials,
    },
    {
      name: "Play again",
      hotkey: "p",
      onPress: onClose,
    },
  ];

  let content;
  if (pending || !result) {
    content = (
      <div className="p-8">
        <Spinner />
      </div>
    );
  } else if (errored) {
    content = (
      <div>
        <div className="px-12 mb-4 text-error-color flex flex-col items-center">
          <WifiXmark width={48} height={48} />
          <div>Failed to post result</div>
        </div>
        <div className="w-full flex flex-row justify-center space-x-2">
          <Button onClick={props.onClose}>Cancel</Button>
          <Button type="primary" onClick={() => postResult(props.keystrokes)}>
            Retry
          </Button>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="h-full flex flex-col">
        <h1>Finish!</h1>
        <div className="grow flex flex-col justify-center space-y-8">
          <Carrossel views={views} />

          <br />

          <ActionBar options={actionBarOptions} />
        </div>
      </div>
    );
  }

  return content;
}
