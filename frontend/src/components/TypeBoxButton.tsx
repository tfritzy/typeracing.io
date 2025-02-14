import React from "react";
import { TypeBox } from "./TypeBox";
import { Timestamp } from "firebase/firestore";

type TypeBoxButtonProps = {
  phrase: string;
  onPhraseComplete: () => void;
};

export const TypeBoxButton = (props: TypeBoxButtonProps) => {
  const [lockedCharIndex, setLockedCharIndex] = React.useState<number>(0);

  const getNow = React.useCallback(() => Timestamp.now(), []);

  const handleWordComplete = React.useCallback(
    (charIndex: number) => {
      setLockedCharIndex(charIndex);

      if (charIndex >= props.phrase.length) {
        props.onPhraseComplete();
        setLockedCharIndex(0);
      }
    },
    [props]
  );

  return (
    <TypeBox
      phrase={props.phrase}
      lockedCharacterIndex={lockedCharIndex}
      onWordComplete={handleWordComplete}
      isLocked={false}
      getNow={getNow}
    />
  );
};
