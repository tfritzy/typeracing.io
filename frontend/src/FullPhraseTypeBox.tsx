import React from "react";
import { TypeBox } from "./TypeBox";

type FullPhraseTypeBoxProps = {
 phrase: string;
 onPhraseComplete: () => void;
};

export const FullPhraseTypeBox = (
 props: FullPhraseTypeBoxProps
) => {
 const [wordIndex, setWordIndex] = React.useState(0);

 const words = props.phrase.split(" ");

 return (
  <TypeBox
   words={words}
   wordIndex={wordIndex}
   onWordComplete={(word) => {
    if (wordIndex >= words.length - 1) {
     props.onPhraseComplete();
    } else {
     setWordIndex(wordIndex + 1);
    }
   }}
  />
 );
};
