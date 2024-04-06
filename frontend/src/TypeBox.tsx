import React, {
 useEffect,
 useLayoutEffect,
 useState,
} from "react";

type TypeBoxProps = {
 words: string[];
 wordIndex: number;
 onWordComplete: (word: string) => void;
};

export const TypeBox = (props: TypeBoxProps) => {
 const [currentWord, setCurrentWord] = useState("");
 const [inputWidth, setInputWidth] = useState(0);
 const phraseRef = React.useRef<HTMLDivElement>(null);
 const cursorRef = React.useRef<HTMLSpanElement>(null);
 const [cursorXPos, setCursorXPos] = useState(0);
 const [cursorYPos, setCursorYPos] = useState(0);

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

 useLayoutEffect(() => {
  if (cursorRef.current) {
   const cursorRect =
    cursorRef.current.getBoundingClientRect();
   setCursorXPos(cursorRect.left);
   setCursorYPos(cursorRect.top);
  }
 }, [currentWord]);

 let text = [
  <span className="text-white">
   {props.words.slice(0, props.wordIndex).join(" ") + " "}
  </span>,
 ];

 for (let i = 0; i < currentWord.length; i++) {
  if (currentWord[i] !== props.words[props.wordIndex][i]) {
   text.push(
    <span className="text-red-500 underline">
     {props.words[props.wordIndex][i] || currentWord[i]}
    </span>
   );
  } else {
   text.push(
    <span className="text-white">{currentWord[i]}</span>
   );
  }
 }

 text.push(<span ref={cursorRef} key="cursor" />);

 let remainingText = props.words
  .slice(props.wordIndex)
  .join(" ");
 text.push(
  <span className="text-gray-500">
   {remainingText.slice(currentWord.length)}
  </span>
 );

 return (
  <div
   style={{
    position: "relative",
   }}
  >
   <div className="text-lg font-mono max-w-lg">
    <div ref={phraseRef}>{text}</div>
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
    <div
     className="bg-white h-[16px] w-[1px] absolute"
     style={{
      top: cursorYPos,
      left: cursorXPos,
     }}
    />
   </div>
  </div>
 );
};
