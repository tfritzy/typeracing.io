import React, { useEffect, useState } from "react";

type TypeBoxProps = {
 words: string[];
 wordIndex: number;
 onWordComplete: (word: string) => void;
};

export const TypeBox = (props: TypeBoxProps) => {
 const [currentWord, setCurrentWord] = useState("");
 const [inputWidth, setInputWidth] = useState(0);
 const phraseRef = React.useRef<HTMLDivElement>(null);

 useEffect(() => {
  if (phraseRef.current) {
   setInputWidth(phraseRef.current.clientWidth);
  }
 }, [
  props.words,
  props.wordIndex,
  phraseRef.current?.clientWidth,
 ]);

 const handleInput = (
  event: React.ChangeEvent<HTMLInputElement>
 ) => {
  if (props.wordIndex >= props.words.length) {
   return;
  }

  console.log(event.target.value);
  console.log(props.words[props.wordIndex]);
  if (
   event.target.value ===
   props.words[props.wordIndex] + " "
  ) {
   props.onWordComplete(event.target.value);
   setCurrentWord("");
  } else {
   setCurrentWord(event.target.value);
  }
 };

 let matchingText = [
  <span className="text-white">
   {props.words.slice(0, props.wordIndex).join(" ") + " "}
  </span>,
 ];

 for (let i = 0; i < currentWord.length; i++) {
  if (currentWord[i] !== props.words[props.wordIndex][i]) {
   matchingText.push(
    <span className="text-red-500 underline">
     {props.words[props.wordIndex][i] || currentWord[i]}
    </span>
   );
  } else {
   matchingText.push(
    <span className="text-white">{currentWord[i]}</span>
   );
  }
 }

 let remainingText = props.words
  .slice(props.wordIndex)
  .join(" ");
 remainingText = remainingText.slice(currentWord.length);

 return (
  <div
   style={{
    position: "relative",
   }}
  >
   <div className="text-lg font-mono max-w-lg">
    <div ref={phraseRef}>
     {matchingText}
     <span className="text-gray-500">{remainingText}</span>
    </div>
    <input
     value={currentWord}
     onChange={handleInput}
     style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: `${inputWidth}px`,
      maxWidth: "100%",
      height: "100%",
      background: "transparent",
      color: "transparent",
      border: "none",
     }}
    />
   </div>
  </div>
 );
};
