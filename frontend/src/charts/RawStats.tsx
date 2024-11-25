import { ReportTimeTrialResponse } from "../compiled";
import { Bar } from "../components/Bar";
import {
  formatAccuracy,
  formatDash,
  formatTimeSeconds,
  formatWpm,
} from "../helpers/time";

type Value = {
  format: (value: number) => string;
  value: number;
  maxValue?: number;
  worstValueForInverted?: number;
};

type RowProps = {
  name: string;
  values: Value[];
};

function Row(props: RowProps) {
  const values = props.values.map((val) => {
    let percent;
    if (val.maxValue && !!val.worstValueForInverted) {
      const distFromBottom = val.value - val.worstValueForInverted;
      const rangeSize = val.maxValue - val.worstValueForInverted;
      percent = Math.min(distFromBottom / rangeSize, 1);
      percent = Math.max(0.03, percent);
    } else if (val.maxValue) {
      percent = Math.min(val.value / val.maxValue, 1);
      percent = Math.max(0.03, percent);
    }
    return (
      <div className="relative">
        {percent !== undefined && <Bar percentFilled={percent * 100} />}
        <div className="absolute left-0 top-0 w-full text-sm font-medium text-base-100 text-center py-1 rounded-sm font-mono">
          {val.format(val.value)}
        </div>
      </div>
    );
  });

  return (
    <div className="grid grid-cols-4 gap-x-2 shadow-base-900">
      <div className="text-sm font-medium text-base-300 py-1">{props.name}</div>
      {values}
    </div>
  );
}

type Props = {
  result: ReportTimeTrialResponse;
  phrase: string;
};

export const RawStats = (props: Props) => {
  const bestTime = Math.min(
    props.result.p99_time!,
    props.result.best_run_time!
  );
  const bestWpm = Math.max(props.result.p99_wpm!, props.result.best_run_wpm!);
  const bestAccuracy = props.result.best_run_accuracy!;
  const worstTime = Math.max(props.result.p25_time!, props.result.time!);

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 px-5 mb-1">
        <div />
        <div className="text-sm text-center font-semibold">Time</div>
        <div className="text-sm text-center font-semibold">WPM</div>
        <div className="text-sm text-center font-semibold">Accuracy</div>
      </div>

      <div className="relative p-4 pt-2 rounded-lg flex flex-col space-y-2">
        <div className="text-base-300 font-semibold">You</div>
        <Row
          name="This race"
          values={[
            {
              value: props.result.time!,
              maxValue: bestTime,
              format: formatTimeSeconds,
              worstValueForInverted: worstTime,
            },
            {
              value: props.result.wpm!,
              maxValue: bestWpm,
              format: formatWpm,
            },
            {
              value: props.result.accuracy!,
              maxValue: bestAccuracy,
              format: formatAccuracy,
            },
          ]}
        />
        <Row
          name="Your best"
          values={[
            {
              value: props.result.best_run_time!,
              maxValue: bestTime,
              format: formatTimeSeconds,
              worstValueForInverted: worstTime,
            },
            {
              value: props.result.best_run_wpm!,
              maxValue: bestWpm,
              format: formatWpm,
            },
            {
              value: props.result.accuracy!,
              maxValue: bestAccuracy,
              format: formatAccuracy,
            },
          ]}
        />
      </div>

      <div className="py-3" />

      <div className="relative p-4 pt-2 rounded-lg flex flex-col space-y-2">
        <div className="text-base-300 font-semibold">Globally</div>
        <Row
          name="99th percentile"
          values={[
            {
              value: props.result.p99_time!,
              maxValue: bestTime,
              format: formatTimeSeconds,
              worstValueForInverted: worstTime,
            },
            {
              value: props.result.p99_wpm!,
              maxValue: bestWpm,
              format: formatWpm,
            },
            {
              value: 0,
              format: formatDash,
            },
          ]}
        />
        <Row
          name="90th percentile"
          values={[
            {
              value: props.result.p90_time!,
              maxValue: bestTime,
              format: formatTimeSeconds,
              worstValueForInverted: worstTime,
            },
            {
              value: props.result.p90_wpm!,
              maxValue: bestWpm,
              format: formatWpm,
            },
            {
              value: 0,
              format: formatDash,
            },
          ]}
        />
        <Row
          name="50th percentile"
          values={[
            {
              value: props.result.p50_time!,
              maxValue: bestTime,
              format: formatTimeSeconds,
              worstValueForInverted: worstTime,
            },
            {
              value: props.result.p50_wpm!,
              maxValue: bestWpm,
              format: formatWpm,
            },
            {
              value: 0,
              format: formatDash,
            },
          ]}
        />
        <Row
          name="25th percentile"
          values={[
            {
              value: props.result.p25_time!,
              maxValue: bestTime,
              format: formatTimeSeconds,
              worstValueForInverted: worstTime,
            },
            {
              value: props.result.p25_wpm!,
              maxValue: bestWpm,
              format: formatWpm,
            },
            {
              value: 0,
              format: formatDash,
            },
          ]}
        />
      </div>
    </div>
  );
};
