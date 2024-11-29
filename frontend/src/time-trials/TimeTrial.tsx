import React from "react";
import { useParams } from "react-router-dom";
import { TimeTrialTypeBox } from "./TimeTrialTypeBox";
import { decodeTimeTrial, KeyStroke } from "../compiled";
import type { TimeTrial as TimeTrialData } from "../compiled";
import { TrialResultsModal } from "./TrialResultsModal";
import { Hotkey } from "../components/Hotkey";
import { Modal } from "../components/Modal";

const apiUrl = process.env.REACT_APP_API_ADDRESS;

type ResolvedTimeTrial = {
  id: string;
  name: string;
  phrase: string;
  global_wpm: { [key: number]: number };
};

function parseTimeTrial(trial: TimeTrialData): ResolvedTimeTrial | null {
  if (!trial.id || !trial.name || !trial.phrase) {
    console.log("rejecting", trial);
    return null;
  }

  return {
    global_wpm: trial.global_wpm || {},
    id: trial.id,
    name: trial.name,
    phrase: trial.phrase,
  };
}

export function TimeTrial() {
  const params = useParams();
  const [trial, setTrial] = React.useState<TimeTrialData | undefined>(
    undefined
  );
  const [resultsOpen, setResultsOpen] = React.useState<boolean>(false);
  const [errored, setErrored] = React.useState<boolean>(false);
  const [keystrokes, setKeystrokes] = React.useState<KeyStroke[]>([]);

  React.useEffect(() => {
    if (!params.id) {
      return;
    }

    fetch(apiUrl + `/api/time-trial?id=${params.id}`)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => new Uint8Array(arrayBuffer))
      .then((data) => {
        const decoded = parseTimeTrial(decodeTimeTrial(data));

        if (decoded !== null) {
          setTrial(decoded);
        } else {
          setErrored(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [params.id]);

  const onComplete = React.useCallback((keystrokes: KeyStroke[]) => {
    setKeystrokes(keystrokes);
    setResultsOpen(true);
  }, []);

  if (errored) {
    return <div className="grow">Womp womp</div>;
  }

  if (!trial?.id) {
    return <div className="grow"></div>;
  }

  return (
    <>
      <div className="grow flex flex-col justify-center">
        <div className="grow" />
        <div className="grow flex flex-col justify-center">
          <TimeTrialTypeBox trial={trial} onPhraseComplete={onComplete} />
        </div>

        <div className="flex flex-col items-center justify-center grow">
          <div className="flex flex-row rounded-full px-3 bg-base-900 border border-base-700 shadow-sm shadow-shadow-color text-base-300">
            <div className="flex flex-row items-center space-x-2 p-2">
              <span>Time trials</span>
              <Hotkey code="t" />
            </div>

            <div className="h-6 m-auto border-r ml-1 mr-1 py-3 border-base-700" />

            <div className="flex flex-row items-center space-x-2 p-2">
              <span>View stats</span>
              <Hotkey code="s" />
            </div>
          </div>
        </div>
      </div>

      <TrialResultsModal
        keystrokes={keystrokes}
        phrase={trial.phrase!}
        onClose={() => setResultsOpen(false)}
        shown={resultsOpen}
        trialId={trial.id}
      />
    </>
  );
}
