import { TimeBarChart } from "../charts/TimeBarChart";
import { ReportTimeTrialResponse } from "../compiled";
import { RawStats } from "../charts/RawStats";
import { WpmOverTime } from "../charts/WpmOverTimeChart";
import { formatTime } from "../helpers/time";
import { Carrossel } from "../components/Carrossel";
import { PercentileBarChart } from "../charts/PercentileBarChart";

type Props = {
  results: ReportTimeTrialResponse;
  phrase: string;
};

export function TrialResultsModal(props: Props) {
  const views = [
    {
      id: "Time",
      render: () => (
        <TimeBarChart
          data={props.results.global_times!}
          mostRecentTime={props.results.time!}
        />
      ),
    },
    {
      id: "WPM",
      render: () => (
        <PercentileBarChart
          data={props.results.global_times!}
          phrase={props.phrase}
          mostRecentWpm={props.results.wpm!}
        />
      ),
    },
  ];

  return (
    <div className="fixed max-w-[600px] max-h-[80vh] overflow-y-auto rounded border border-base-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-2xl brightness-105 flex flex-col items-center">
      <div className="px-8 p-3 w-full border-b border-base-600">
        <div className="font-semibold">Resuls</div>
      </div>

      <div className="w-full pt-4 flex flex-col space-y-4 px-4">
        <RawStats result={props.results} phrase={props.phrase} />

        <div className="bg-base-800 px-2 py-4">
          <div className="pl-4 font-semibold">Race breakdown</div>
          <WpmOverTime
            wpm_by_second={props.results.wpm_by_second!}
            raw_wpm_by_second={props.results.raw_wpm_by_second!}
            errors={props.results.errors_at_time!}
          />
        </div>

        <div className="bg-base-800 px-2 py-4">
          <div className="pl-4 font-semibold">Global stats</div>
          <Carrossel views={views} />
        </div>
      </div>
    </div>
  );
}
