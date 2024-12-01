import { StarSolid } from "iconoir-react";
import { Bar } from "../components/Bar";
import { formatAccuracy, formatDash, formatWpm } from "../helpers/time";
import { ResolvedTimeTrialResult } from "../time-trials/TrialResults";

type Value = {
  format: (value: number) => string;
  value: number;
  maxValue?: number;
  worstValueForInverted?: number;
  greyscale?: boolean;
  star?: boolean;
};

type RowProps = {
  name: string;
  values: Value[];
};

function Row(props: RowProps) {
  const values = props.values.map((val, i) => {
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
      <div key={i} className="relative">
        {percent !== undefined && (
          <Bar greyscale={!!val.greyscale} percentFilled={percent * 100} />
        )}
        <div className="absolute left-0 top-0 w-full text-sm font-medium text-base-100 text-center py-1 rounded-sm font-mono flex flex-row space-x-1 items-center justify-center">
          <span>{val.format(val.value)}</span>
          {val.star && <StarSolid height={16} />}
        </div>
      </div>
    );
  });

  return (
    <div className="grid grid-cols-4 gap-x-2 shadow-base-900">
      <div key="name" className="text-sm font-medium text-base-300 py-1">
        {props.name}
      </div>
      {values}
    </div>
  );
}

type PercentileGroup = "p99" | "p90" | "p50" | "p25";
// function getPercentileGroup(result: ReportTimeTrialResponse): PercentileGroup {
//   if (result.wpm >= thresholds.p99_wpm) {
//     return "Elite";
//   } else if (wpm >= thresholds.p90_wpm) {
//     return "Advanced";
//   } else if (wpm >= thresholds.p50_wpm) {
//     return "Proficient";
//   } else if (wpm >= thresholds.p25_wpm) {
//     return "Intermediate";
//   } else {
//     return "Beginner";
//   }
// }

type Props = {
  result: ResolvedTimeTrialResult;
  phrase: string;
};

export const RawStats = (props: Props) => {
  const result = props.result;
  console.log(result);
  const bestWpm = Math.max(
    result.p99_wpm,
    result.best_run_wpm || 0,
    result.wpm!
  );
  const bestAccuracy = result.best_run_accuracy;
  const setPr = !!result.best_run_wpm && result.wpm! > result.best_run_wpm;

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 mb-1">
        <div />
        <div className="text-sm text-center font-semibold">WPM</div>
        <div className="text-sm text-center font-semibold">Accuracy</div>
      </div>

      <div className="relative pt-2 rounded-lg flex flex-col space-y-2">
        <div className="text-base-300 font-semibold">You</div>
        <Row
          name="This race"
          key="this_race"
          values={[
            {
              value: result.wpm || 0,
              maxValue: bestWpm,
              format: formatWpm,
              star: setPr,
            },
            {
              value: result.accuracy || 0,
              maxValue: bestAccuracy,
              format: formatAccuracy,
            },
          ]}
        />
        <Row
          name={setPr ? "Previous best" : "Your best"}
          key="best"
          values={[
            {
              value: result.best_run_wpm || 0,
              maxValue: bestWpm,
              format: formatWpm,
            },
            {
              value: bestAccuracy || 0,
              maxValue: bestAccuracy,
              format: formatAccuracy,
            },
          ]}
        />
      </div>

      <div className="py-3" />

      <div className="relative pt-2 rounded-lg flex flex-col space-y-2">
        <div className="text-base-300 font-semibold">Globally</div>
        <Row
          name="99th percentile"
          key="99"
          values={[
            {
              value: result.p99_wpm,
              maxValue: bestWpm,
              format: formatWpm,
              greyscale: true,
            },
            {
              value: 0,
              format: formatDash,
            },
          ]}
        />
        <Row
          name="90th percentile"
          key="90"
          values={[
            {
              value: result.p90_wpm,
              maxValue: bestWpm,
              format: formatWpm,
              greyscale: true,
            },
            {
              value: 0,
              format: formatDash,
            },
          ]}
        />
        <Row
          name="50th percentile"
          key="50"
          values={[
            {
              value: result.p50_wpm,
              maxValue: bestWpm,
              format: formatWpm,
              greyscale: true,
            },
            {
              value: 0,
              format: formatDash,
            },
          ]}
        />
        <Row
          name="25th percentile"
          key="25"
          values={[
            {
              value: result.p25_wpm,
              maxValue: bestWpm,
              format: formatWpm,
              greyscale: true,
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
