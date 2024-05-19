import React from "react";
import { TypeBox } from "./TypeBox";

type TypeBoxButtonProps = {
 phrase: string;
 onPhraseComplete: () => void;
};

export const TypeBoxButton = (
 props: TypeBoxButtonProps
) => {
 const [lockedCharIndex, setLockedCharIndex] =
  React.useState<number>(0);

 const handleWordComplete = React.useCallback(
  (charIndex: number) => {
   setLockedCharIndex(charIndex);

   if (charIndex >= props.phrase.length) {
    props.onPhraseComplete();
   }
  },
  [props]
 );

 return (
  <TypeBox
   phrase={props.phrase}
   lockedCharacterIndex={lockedCharIndex}
   onWordComplete={handleWordComplete}
   startTime={0}
  />
 );
};
