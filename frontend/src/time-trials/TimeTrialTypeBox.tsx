import React from "react";
import { TypeBox } from "../components/TypeBox";
import { KeyStroke, TimeTrial } from "../compiled";
import Timer from "../components/Timer";

type Props = {
  trial: TimeTrial;
  onPhraseComplete: (keystrokes: KeyStroke[]) => void;
};

export function TimeTrialTypeBox(props: Props) {
  const { onPhraseComplete, trial } = props;
  const [lockedCharIndex, setLockedCharIndex] = React.useState<number>(0);
  const keyStrokes = React.useRef<KeyStroke[]>([]);
  const [startTime, setStartTime] = React.useState<number>(0);
  const [done, setDone] = React.useState<boolean>(true);

  const start = React.useCallback(() => {
    setDone(false);
    setStartTime(Date.now());
    keyStrokes.current = [];
  }, []);

  const stop = React.useCallback(() => {
    setDone(true);
    keyStrokes.current = [];
    setLockedCharIndex(0);
    setStartTime(Date.now());
  }, []);

  const handleWordComplete = React.useCallback(
    (charIndex: number, wordStrokes: KeyStroke[]) => {
      setLockedCharIndex(charIndex);

      for (let i = 0; i < wordStrokes.length; i++) {
        wordStrokes[i].time! -= startTime / 1000;
      }
      wordStrokes = wordStrokes.filter((ks) => ks.time && ks.time >= 0);

      keyStrokes.current.push(...wordStrokes);
      console.log(keyStrokes);

      if (charIndex >= trial.phrase!.length) {
        setDone(true);
        onPhraseComplete(keyStrokes.current);
        stop();
      }
    },
    [trial, onPhraseComplete, startTime, stop]
  );

  return (
    <div>
      <div
        className="transition-opacity mb-2"
        style={{ color: startTime > 0 ? "var(--accent)" : "var(--base-500)" }}
      >
        <Timer startTime={startTime || Date.now()} running={!done} />
      </div>
      <TypeBox
        phrase={trial.phrase!}
        lockedCharacterIndex={lockedCharIndex}
        onWordComplete={handleWordComplete}
        isLocked={false}
        onFirstKeystroke={start}
      />
    </div>
  );
}
