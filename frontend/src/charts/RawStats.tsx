import { ReportTimeTrialResponse } from "../compiled";
import { formatTime } from "../helpers/time";

type BoxProps = {
  title: string;
  body: string;
};

type Props = {
  result: ReportTimeTrialResponse;
  phrase: string;
};

export const RawStats = (props: Props) => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-stretch justify-around w-full">
        <div>
          <div className="font-bold text-sm">Previous best</div>
          <div className="font-mono">
            {formatTime(props.result.time! * 1000)}
          </div>
        </div>
        <div>
          <div className="font-bold text-sm">WPM</div>
          <div className="font-mono">{props.result.wpm?.toFixed(1)!}</div>
        </div>
        <div>
          <div className="font-bold text-sm">Accuracy</div>
          <div className="font-mono">97%</div>
        </div>
      </div>
    </div>
  );
};
