import React from "react";
import { TypeBox } from "../components/TypeBox"
import { KeyStroke, TimeTrial } from "../compiled";

type Props = {
    trial: TimeTrial;
    onPhraseComplete: (keystrokes: KeyStroke[]) => void;
}

export function TimeTrialTypeBox(props: Props) {
    const [lockedCharIndex, setLockedCharIndex] =
        React.useState<number>(0);
    const keyStrokes = React.useRef<KeyStroke[]>([]);
    const [startTime, setStartTime] = React.useState<number>(0)

    const handleWordComplete = React.useCallback(
        (charIndex: number, wordStrokes: KeyStroke[]) => {
            setLockedCharIndex(charIndex);

            for (let i = 0; i < wordStrokes.length; i++)
            {
                wordStrokes[i].time! -= startTime;
            }
            keyStrokes.current.push(...wordStrokes);

            if (charIndex >= props.trial.phrase!.length) {
                props.onPhraseComplete(keyStrokes.current);
            }
        },
        [props, startTime]
    );

    return <TypeBox
        phrase={props.trial.phrase!}
        lockedCharacterIndex={lockedCharIndex}
        onWordComplete={handleWordComplete}
        isLocked={false}
        onFirstKeystroke={() => setStartTime(Date.now() / 1000)}
    />
}