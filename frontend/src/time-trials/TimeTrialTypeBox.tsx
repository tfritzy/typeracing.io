import React from "react";
import { TypeBox } from "../components/TypeBox"
import { TimeTrial } from "../types/TimeTrial"
import { KeyStroke } from "../compiled";

type Props = {
    trial: TimeTrial;
}

export function TimeTrialTypeBox(props: Props) {
    const [lockedCharIndex, setLockedCharIndex] =
        React.useState<number>(0);
    const keyStrokes = React.useRef<KeyStroke[]>([]);

    const handleWordComplete = React.useCallback(
        (charIndex: number, wordStrokes: KeyStroke[]) => {
            setLockedCharIndex(charIndex);
            keyStrokes.current.push(...wordStrokes);

            if (charIndex >= props.trial.phrase.length) {
                // props.onPhraseComplete();
            }
        },
        [props]
    );

    return <>{JSON.stringify(keyStrokes.current)}<TypeBox
        phrase={props.trial.phrase}
        lockedCharacterIndex={lockedCharIndex}
        onWordComplete={handleWordComplete}
        startTime={0}
    /></>
}