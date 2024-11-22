import { Presentation, PresentationSolid } from "iconoir-react";
import { ReportTimeTrialResponse } from "../compiled";
import { Results } from "../game/Results";
import { formatTime } from "../helpers/time";

type BoxProps = {
  children: JSX.Element;
};

function Box(props: BoxProps) {
  return (
    <div className="px-4 p-2 border border-base-600">{props.children}</div>
  );
}

type Props = {
  result: ReportTimeTrialResponse;
  phrase: string;
};

export const RawStats = (props: Props) => {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-sm text-left">Player</th>
          <th className="text-sm text-left">Time</th>
          <th className="text-sm text-left">WPM</th>
          <th className="text-sm text-left">Accuracy</th>
          <th className="text-sm text-left">Fixing errors</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border border-base-600">
          <td className="text-sm px-1">Your best</td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
        </tr>
        <tr className="border border-base-600 mb-1">
          <td className="text-sm py-3 px-2">You</td>
          <td className="text-sm">3:21</td>
          <td className="text-sm">87</td>
          <td className="text-sm">91%</td>
          <td className="text-sm">00:32</td>
        </tr>

        <tr className="border border-base-600">
          <td className="text-sm px-1">Your average</td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
        </tr>
        <tr className="border border-base-600 mb-1">
          <td className="text-sm py-3 px-2">You</td>
          <td className="text-sm">3:21</td>
          <td className="text-sm">87</td>
          <td className="text-sm">91%</td>
          <td className="text-sm">00:32</td>
        </tr>

        <tr className="border border-base-600">
          <td className="text-sm">This race</td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
        </tr>
        <tr className="border border-base-600 mb-1">
          <td className="text-sm py-3 px-2">You</td>
          <td className="text-sm">3:41</td>
          <td className="text-sm">82</td>
          <td className="text-sm">85%</td>
          <td className="text-sm">00:32</td>
        </tr>

        <tr className="border border-base-600">
          <td className="text-sm">Globally</td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
          <td className="text-sm"></td>
        </tr>
        <tr className="border border-base-600">
          <td className="text-sm py-3 px-2">99th percentile</td>
          <td className="text-sm">2:41</td>
          <td className="text-sm">146</td>
          <td className="text-sm">99%</td>
          <td className="text-sm">00:04</td>
        </tr>
        <tr className="border border-base-600">
          <td className="text-sm py-3 px-2">90th percentile</td>
          <td className="text-sm">3:21</td>
          <td className="text-sm">61</td>
          <td className="text-sm">91%</td>
          <td className="text-sm">00:12</td>
        </tr>
        <tr className="border border-base-600">
          <td className="text-sm py-3 px-2">50th percentile</td>
          <td className="text-sm">4:24</td>
          <td className="text-sm">44</td>
          <td className="text-sm">85%</td>
          <td className="text-sm">00:29</td>
        </tr>
        <tr className="border border-base-600">
          <td className="text-sm py-3 px-2">25th percentile</td>
          <td className="text-sm">6:03</td>
          <td className="text-sm">24</td>
          <td className="text-sm">80%</td>
          <td className="text-sm">00:59</td>
        </tr>
      </tbody>
    </table>
  );
};
