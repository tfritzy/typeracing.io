import { PercentileBarChart } from "../charts/PercentileBarChart";
import { Carrossel } from "../components/Carrossel";

const views = [
  {
    id: "Percentile",
    render: () => {
      return <PercentileBarChart />;
    },
  },
  {
    id: "WPM",
    render: () => {
      return <PercentileBarChart />;
    },
  },
  {
    id: "Something",
    render: () => {
      return <PercentileBarChart />;
    },
  },
  {
    id: "Something else",
    render: () => {
      return <PercentileBarChart />;
    },
  },
];

export function TrialResultsModal() {
  return (
    <div className="fixed rounded border border-base-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-md backdrop-brightness-110 flex flex-col items-center">
      <Carrossel views={views} />
    </div>
  );
}
