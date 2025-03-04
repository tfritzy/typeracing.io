import React, { useMemo } from "react";
import { TypeBox } from "./TypeBox";
import { Timestamp } from "firebase/firestore";
import { ProgrammingLanguage } from "@shared/types";

type TypeBoxButtonProps = {
  phrase: string;
  onPhraseComplete: () => void;
  programmingLanguage: ProgrammingLanguage | undefined;
};

export function TypeBoxButton({
  phrase,
  onPhraseComplete,
  programmingLanguage,
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
      programmingLanguage={programmingLanguage}
    />
  );
}
