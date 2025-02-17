import React, { useMemo } from "react";
import { TypeBox } from "./TypeBox";
import { Timestamp } from "firebase/firestore";

type TypeBoxButtonProps = {
  phrase: string;
  onPhraseComplete: () => void;
};

export function TypeBoxButton({
  phrase,
  onPhraseComplete,
}: TypeBoxButtonProps) {
  const getNow = React.useCallback(() => Timestamp.now(), []);
  const startTime = useMemo(() => getNow(), []);
  const handlePhraseComplete = React.useCallback(() => {
    onPhraseComplete();
  }, [onPhraseComplete]);

  return (
    <TypeBox
      phrase={phrase}
      onPhraseComplete={handlePhraseComplete}
      isLocked={false}
      getNow={getNow}
      startTime={startTime}
    />
  );
}
