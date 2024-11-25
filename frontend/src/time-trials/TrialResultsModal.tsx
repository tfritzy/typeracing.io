import { TimeBarChart } from "../charts/TimeBarChart";
import { ReportTimeTrialResponse } from "../compiled";
import { RawStats } from "../charts/RawStats";
import { PercentileBarChart } from "../charts/PercentileBarChart";
import { Carrossel } from "../components/Carrossel";
import { WpmOverTime } from "../charts/WpmOverTimeChart";

type Props = {
  results: ReportTimeTrialResponse;
  phrase: string;
};

export function TrialResultsModal(props: Props) {
  const views = [
    {
      id: "Performance",
      render: () => <RawStats result={props.results} phrase={props.phrase} />,
    },
    {
      id: "WPM Distribution",
      render: () => (
        <PercentileBarChart
          data={props.results.global_times!}
          phrase={props.phrase}
          mostRecentWpm={props.results.wpm!}
        />
      ),
    },
    {
      id: "Time Distribution",
      render: () => (
        <TimeBarChart
          data={props.results.global_times!}
          mostRecentTime={props.results.time!}
        />
      ),
    },
    {
      id: "Race",
      render: () => (
        <WpmOverTime
          errors={props.results.errors_at_time!}
          raw_wpm_by_second={props.results.raw_wpm_by_second!}
          wpm_by_second={props.results.wpm_by_second!}
        />
      ),
    },
  ];

  return (
    <div className="fixed backdrop-blur-xl backdrop-brightness-[.8] shadow-2xl shadow-gray-950 overflow-y-auto rounded-lg border border-base-800 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="px-8 p-3 w-full border-b border-base-800">
        <div className="font-semibold">Resuls</div>
      </div>

      <div className="p-4">
        <Carrossel views={views} />
      </div>
    </div>
  );
}
