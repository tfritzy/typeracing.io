import React from "react";
import { TypeBox } from "../components/TypeBox";
import { KeyStroke, TimeTrial } from "../compiled";
import Timer from "../components/Timer";

type Props = {
  trial: TimeTrial;
  onPhraseComplete: (keystrokes: KeyStroke[]) => void;
};

export function TimeTrialTypeBox(props: Props) {
  const [lockedCharIndex, setLockedCharIndex] = React.useState<number>(0);
  const keyStrokes = React.useRef<KeyStroke[]>([]);
  const [startTime, setStartTime] = React.useState<number>(0);
  const [done, setDone] = React.useState<boolean>(false);

  const handleWordComplete = React.useCallback(
    (charIndex: number, wordStrokes: KeyStroke[]) => {
      setLockedCharIndex(charIndex);

      for (let i = 0; i < wordStrokes.length; i++) {
        wordStrokes[i].time! -= startTime / 1000;
      }
      keyStrokes.current.push(...wordStrokes);

      if (charIndex >= props.trial.phrase!.length) {
        setDone(true);
        props.onPhraseComplete(keyStrokes.current);
      }
    },
    [props, startTime]
  );

  return (
    <div>
      <div
        className="transition-opacity"
        style={{ opacity: startTime > 0 ? 1 : 0.5 }}
      >
        <Timer
          startTime={startTime || Date.now()}
          stop={done || startTime === 0}
        />
      </div>
      <TypeBox
        phrase={props.trial.phrase!}
        lockedCharacterIndex={lockedCharIndex}
        onWordComplete={handleWordComplete}
        isLocked={false}
        onFirstKeystroke={() => setStartTime(Date.now())}
      />
    </div>
  );
}
