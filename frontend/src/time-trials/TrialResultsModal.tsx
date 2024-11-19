import { PercentileBarChart } from "../charts/PercentileBarChart";
import { TimeBarChart } from "../charts/TimeBarChart";
import { ReportTimeTrialResponse } from "../compiled";
import { Carrossel } from "../components/Carrossel";

type Props = {
  results: ReportTimeTrialResponse;
  phrase: string;
};

export function TrialResultsModal(props: Props) {
  const views = [
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
        return <TimeBarChart data={props.results.global_times!} />;
      },
    },
  ];

  return (
    <div className="fixed rounded border border-base-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-md backdrop-brightness-110 flex flex-col items-center">
      <Carrossel views={views} />
    </div>
  );
}
