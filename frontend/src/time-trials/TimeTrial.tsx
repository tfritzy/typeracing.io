import React from "react";
import { Link, useParams } from "react-router-dom";
import { TimeTrialTypeBox } from "./TimeTrialTypeBox";
import {
  decodeReportTimeTrialResponse,
  decodeTimeTrial,
  encodeReportTimeTrialRequest,
  KeyStroke,
  ReportTimeTrialResponse,
  TimeTrial as TimeTrialData,
} from "../compiled";
import { useAppSelector } from "../store/storeHooks";
import { PlayerState } from "../store/playerSlice";
import { RootState } from "../store/store";
import { TrialResultsModal } from "./TrialResultsModal";
import { NavArrowLeft } from "iconoir-react";

const apiUrl = process.env.REACT_APP_API_ADDRESS;

export function TimeTrial() {
  const player: PlayerState = useAppSelector(
    (state: RootState) => state.player
  );
  const params = useParams();
  const [trial, setTrial] = React.useState<TimeTrialData | undefined>(
    undefined
  );
  const [results, setResults] = React.useState<
    ReportTimeTrialResponse | undefined
  >(undefined);

  React.useEffect(() => {
    if (!params.id) {
      return;
    }

    fetch(apiUrl + `/api/time-trial?id=${params.id}`)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => new Uint8Array(arrayBuffer))
      .then((data) => {
        setTrial(decodeTimeTrial(data));
      })
      .catch((error) => {
        console.log(error);
      });
  }, [params.id]);

  const postResult = React.useCallback(
    (keystrokes: KeyStroke[]) => {
      const opts = {
        method: "POST",
        headers: { "X-Player-Id": player.id, "X-Auth-Token": player.token },
        body: encodeReportTimeTrialRequest({
          id: trial?.id,
          keystrokes: keystrokes,
        }),
      };
      fetch(apiUrl + "/api/time-trial-result", opts)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => new Uint8Array(arrayBuffer))
        .then((data) => {
          console.log("before parsing", data);
          setResults(decodeReportTimeTrialResponse(data));
          console.log("Results", decodeReportTimeTrialResponse(data));
        })
        .catch((error) => {
          console.log(error);
        });
    },
    [player.id, player.token, trial?.id]
  );

  if (!trial) {
    return <div>Loading</div>;
  }

  return (
    <>
      <div className="flex flex-row items-center">
        <NavArrowLeft height={20} />

        <Link to="/time-trials" className="font-medium">
          Time trials
        </Link>
      </div>
      {/* <h1 className="mb-16">{trial.name || "-"}</h1> */}

      <div className="grow flex flex-col justify-center">
        <TimeTrialTypeBox trial={trial} onPhraseComplete={postResult} />
      </div>

      {results && (
        <TrialResultsModal results={results} phrase={trial.phrase!} />
      )}
    </>
  );
}
