import { ReportTimeTrialResponse } from "../compiled";
import { formatAccuracy, formatTime, formatWpm } from "../helpers/time";

type BarProps = {
  percentFilled: number;
};

function Bar(props: BarProps) {
  return (
    <div
      className="bg-accent h-full absolute top-0 left-0"
      style={{ width: `${props.percentFilled}%` }}
    />
  );
}

type Value = {
  format: (value: number) => string;
  value: number;
};

type HeaderProps = {
  text: string;
};

function Header(props: HeaderProps) {
  return (
    <div className="border border-base-700 w-full my-1 mx-0 p-1 px-2 rounded-lg">
      <div className="text-sm px-1 font-semibold">{props.text}</div>
    </div>
  );
}

type RowProps = {
  name: string;
  values: Value[];
};

function Row(props: RowProps) {
  const values = props.values.map((val) => (
    <div className="text-sm text-center py-1 rounded-sm relative">
      {val.format(val.value)}
    </div>
  ));

  return (
    <div className="grid grid-cols-5 gap-x-1 border border-base-700 p-1 px-2 mx-1 mr-2 rounded-lg mb-1">
      <div className="text-sm py-1">{props.name}</div>
      {values}
    </div>
  );
}

type Props = {
  result: ReportTimeTrialResponse;
  phrase: string;
};

export const RawStats = (props: Props) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-5 px-3 mx-1 mr-2">
        <div className="text-sm text-left font-semibold">Player</div>
        <div className="text-sm text-center font-semibold">Time</div>
        <div className="text-sm text-center font-semibold">WPM</div>
        <div className="text-sm text-center font-semibold">Accuracy</div>
        <div className="text-sm text-center font-semibold">Fixing errors</div>
      </div>

      <Header text="This race" />
      <Row
        name="You"
        values={[
          {
            value: props.result.time! * 1000,
            format: formatTime,
          },
          {
            value: props.result.wpm!,
            format: formatWpm,
          },
          {
            value: props.result.accuracy!,
            format: formatAccuracy,
          },
          {
            value: 21,
            format: formatTime,
          },
        ]}
      />
      <br />

      <Header text="Your best" />
      <Row
        name="You"
        values={[
          {
            value: props.result.best_run_time! * 1000,
            format: formatTime,
          },
          {
            value: props.result.best_run_wpm!,
            format: formatWpm,
          },
          {
            value: props.result.accuracy!,
            format: formatAccuracy,
          },
          {
            value: 21,
            format: formatTime,
          },
        ]}
      />
      <br />

      <Header text="Globally" />
      <Row
        name="99th percentile"
        values={[
          {
            value: props.result.p99_time! * 1000,
            format: formatTime,
          },
          {
            value: props.result.p99_wpm!,
            format: formatWpm,
          },
          {
            value: props.result.accuracy!,
            format: formatAccuracy,
          },
          {
            value: 21,
            format: formatTime,
          },
        ]}
      />
      <Row
        name="90th percentile"
        values={[
          {
            value: props.result.p90_time! * 1000,
            format: formatTime,
          },
          {
            value: props.result.p90_wpm!,
            format: formatWpm,
          },
          {
            value: props.result.accuracy!,
            format: formatAccuracy,
          },
          {
            value: 21,
            format: formatTime,
          },
        ]}
      />
      <Row
        name="50th percentile"
        values={[
          {
            value: props.result.p50_time! * 1000,
            format: formatTime,
          },
          {
            value: props.result.p50_wpm!,
            format: formatWpm,
          },
          {
            value: props.result.accuracy!,
            format: formatAccuracy,
          },
          {
            value: 21,
            format: formatTime,
          },
        ]}
      />
      <Row
        name="25th percentile"
        values={[
          {
            value: props.result.p25_time! * 1000,
            format: formatTime,
          },
          {
            value: props.result.p25_wpm!,
            format: formatWpm,
          },
          {
            value: props.result.accuracy!,
            format: formatAccuracy,
          },
          {
            value: 21,
            format: formatTime,
          },
        ]}
      />
    </div>
  );
};
