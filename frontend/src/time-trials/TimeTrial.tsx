import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TimeTrialTypeBox } from "./TimeTrialTypeBox";
import { decodeTimeTrial, KeyStroke } from "../compiled";
import type { TimeTrial as TimeTrialData } from "../compiled";
import { NavArrowLeft } from "iconoir-react";
import { Hotkey } from "../components/Hotkey";
import { TrialResults } from "./TrialResults";

const apiUrl = process.env.REACT_APP_API_ADDRESS;

type ResolvedTimeTrial = {
  id: string;
  name: string;
  phrase: string;
  global_wpm: { [key: number]: number };
  author: string | undefined;
};

function parseTimeTrial(trial: TimeTrialData): ResolvedTimeTrial | null {
  if (!trial.id || !trial.name || !trial.phrase) {
    return null;
  }

  return {
    global_wpm: trial.global_wpm || {},
    id: trial.id,
    name: trial.name,
    phrase: trial.phrase,
    author: trial.author,
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
  const navigate = useNavigate();

  const escape = React.useCallback(() => {
    navigate("/time-trials");
  }, [navigate]);

  React.useEffect(() => {
    const handleHotkeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        escape();
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [escape, navigate]);

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
    <div className="relative h-full flex flex-col">
      <button
        className="flex flex-row space-x-1 items-center w-min"
        onClick={escape}
      >
        <NavArrowLeft width={20} />
        <Hotkey code="Esc" />
      </button>

      <h1>{trial.name}</h1>
      {!resultsOpen && (
        <div
          className="grow-[3] flex flex-col justify-center"
          style={{
            opacity: resultsOpen ? 0 : 1,
          }}
        >
          <TimeTrialTypeBox trial={trial} onPhraseComplete={onComplete} />
          <div className="text-right italic text-lg w-full text-base-500 pr-16">
            {trial.author && "— " + trial.author}
          </div>
        </div>
      )}
      {resultsOpen && (
        <div className="grow">
          <TrialResults
            keystrokes={keystrokes}
            trialName={trial.name!}
            phrase={trial.phrase!}
            onClose={() => setResultsOpen(false)}
            shown={resultsOpen}
            trialId={trial.id}
          />
        </div>
      )}
    </div>
  );
}
