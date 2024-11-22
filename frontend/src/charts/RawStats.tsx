import { ReportTimeTrialResponse } from "../compiled";

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
    <div className="w-full">
      <div className="grid grid-cols-5 w-full">
        <th className="text-sm text-left">Player</th>
        <th className="text-sm text-left">Time</th>
        <th className="text-sm text-left">WPM</th>
        <th className="text-sm text-left">Accuracy</th>
        <th className="text-sm text-left">Fixing errors</th>
      </div>
      <div className="border border-base-600 w-full my-1 mx-0 p-1 px-2 rounded-full">
        <div className="text-sm px-1">Your best</div>
      </div>
      <div className="grid grid-cols-5 border border-base-600 p-3 ml-3 mb-4">
        <td className="text-sm">You</td>
        <td className="text-sm">3:21</td>
        <td className="text-sm">87</td>
        <td className="text-sm">91%</td>
        <td className="text-sm">00:32</td>
      </div>

      <div className="border border-base-600 w-full my-1 mx-0 p-1 px-2 rounded-full">
        <div className="text-sm px-1">Your average</div>
      </div>
      <div className="grid grid-cols-5 border border-base-600 p-3 ml-3 mb-4">
        <td className="text-sm">You</td>
        <td className="text-sm">3:21</td>
        <td className="text-sm">87</td>
        <td className="text-sm">91%</td>
        <td className="text-sm">00:32</td>
      </div>

      <div className="border border-base-600 w-full my-1 mx-0 p-1 px-2 rounded-full">
        <div className="text-sm px-1">This race</div>
      </div>
      <div className="grid grid-cols-5 border border-base-600 p-3 ml-3 mb-4">
        <td className="text-sm ">You</td>
        <td className="text-sm">3:41</td>
        <td className="text-sm">82</td>
        <td className="text-sm">85%</td>
        <td className="text-sm">00:32</td>
      </div>

      <div className="border border-base-600 w-full my-1 mx-0 p-1 px-2 rounded-full">
        <div className="text-sm px-1">Globally</div>
      </div>
      <div className="grid grid-cols-5 border border-base-600 p-3 ml-3">
        <td className="text-sm">99th percentile</td>
        <td className="text-sm">2:41</td>
        <td className="text-sm">146</td>
        <td className="text-sm">99%</td>
        <td className="text-sm">00:04</td>
      </div>
      <div className="grid grid-cols-5 border border-base-600 p-3 ml-3">
        <td className="text-sm">90th percentile</td>
        <td className="text-sm">3:21</td>
        <td className="text-sm">61</td>
        <td className="text-sm">91%</td>
        <td className="text-sm">00:12</td>
      </div>
      <div className="grid grid-cols-5 border border-base-600 p-3 ml-3">
        <td className="text-sm">50th percentile</td>
        <td className="text-sm">4:24</td>
        <td className="text-sm">44</td>
        <td className="text-sm">85%</td>
        <td className="text-sm">00:29</td>
      </div>
      <div className="grid grid-cols-5 border border-base-600 p-3 ml-3">
        <td className="text-sm">25th percentile</td>
        <td className="text-sm">6:03</td>
        <td className="text-sm">24</td>
        <td className="text-sm">80%</td>
        <td className="text-sm">00:59</td>
      </div>
    </div>
  );
};
