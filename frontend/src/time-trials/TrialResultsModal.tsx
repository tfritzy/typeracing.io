import { Clock } from "iconoir-react";
import { PercentileBarChart } from "../charts/PercentileBarChart";
import { TimeBarChart } from "../charts/TimeBarChart";
import { ReportTimeTrialResponse } from "../compiled";
import { Carrossel } from "../components/Carrossel";
import { Results } from "../game/Results";
import { RawStats } from "../charts/RawStats";

type Props = {
  results: ReportTimeTrialResponse;
  phrase: string;
};

export function TrialResultsModal(props: Props) {
  const views = [
    {
      id: "Stats",
      render: () => {
        return <RawStats result={props.results} phrase={props.phrase} />;
      },
    },
    {
      id: "WPM distribution",
      render: () => {
        return (
          <PercentileBarChart
            data={props.results.global_times!}
            phrase={props.phrase}
          />
        );
      },
    },
    {
      id: "Time distribution",
      render: () => {
        return (
          <TimeBarChart
            data={props.results.global_times!}
            mostRecentTime={props.results.time!}
          />
        );
      },
    },
  ];

  return (
    <div className="fixed min-w-[700px] max-h-[80vh] rounded border border-base-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-lg backdrop-brightness-110 flex flex-col items-center">
      <div className="font-semibold pl-4 p-2 border-b border-base-600 w-full">
        Results
      </div>

      <div className="w-full overflow-y-scroll">
        <div className="pt-8">
          <RawStats result={props.results} phrase={props.phrase} />
        </div>

        <PercentileBarChart
          data={props.results.global_times!}
          phrase={props.phrase}
        />

        <TimeBarChart
          data={props.results.global_times!}
          mostRecentTime={props.results.time!}
        />
      </div>
    </div>
  );
}
