import React, {
 useEffect,
 useLayoutEffect,
 useState,
} from "react";

function lerp(start: number, end: number, alpha: number) {
 return start + (end - start) * alpha;
}

type TypeBoxProps = {
 phrase: string;
 lockedCharacterIndex: number;
 onWordComplete: (
  charIndex: number,
  charCompletionTimes: number[]
 ) => void;
};

export const TypeBox = (props: TypeBoxProps) => {
 const [currentWord, setCurrentWord] = useState("");
 const [inputWidth, setInputWidth] = useState(0);
 const phraseRef = React.useRef<HTMLDivElement>(null);
 const cursorRef = React.useRef<HTMLSpanElement>(null);
 const [cursorXPos, setCursorXPos] = useState(0);
 const [cursorYPos, setCursorYPos] = useState(0);
 const [targetCursorXPos, setTargetCursorXPos] =
  useState(0);
 const [targetCursorYPos, setTargetCursorYPos] =
  useState(0);
 const [cursorPulsing, setCursorPinging] = useState(true);
 const setPingingRef =
  React.useRef<NodeJS.Timeout | null>();

 useEffect(() => {
  if (phraseRef.current) {
   setInputWidth(phraseRef.current.clientWidth);
  }
 }, [props.phrase, phraseRef.current?.clientWidth]);

 const handleInput = (
  event: React.ChangeEvent<HTMLInputElement>
 ) => {
  if (props.lockedCharacterIndex >= props.phrase.length) {
   return;
  }

  setCursorPinging(false);
  if (setPingingRef.current) {
   clearTimeout(setPingingRef.current);
  }
  setPingingRef.current = setTimeout(() => {
   setCursorPinging(true);
  }, 1000);

  setCurrentWord(event.target.value);
  if (
   event.target.value === " " ||
   props.lockedCharacterIndex + currentWord.length ===
    props.phrase.length
  ) {
   const word = props.phrase.slice(
    props.lockedCharacterIndex,
    props.lockedCharacterIndex + currentWord.length
   );
   if (word === currentWord) {
    props.onWordComplete(
     props.lockedCharacterIndex + currentWord.length,
     []
    );
    setCurrentWord("");
   }
  }
 };

 useEffect(() => {
  let frameId: number;

  const animate = () => {
   setCursorXPos((prevX) =>
    lerp(prevX, targetCursorXPos, 0.5)
   );
   setCursorYPos((prevY) =>
    lerp(prevY, targetCursorYPos, 0.5)
   );

   frameId = requestAnimationFrame(animate);
  };

  frameId = requestAnimationFrame(animate);

  return () => {
   cancelAnimationFrame(frameId);
  };
 }, [targetCursorXPos, targetCursorYPos]);

 useEffect(() => {
  if (cursorRef.current) {
   const cursorRect =
    cursorRef.current.getBoundingClientRect();
   setCursorXPos(cursorRect.left);
   setCursorYPos(cursorRect.top);
  }
 }, []);

 useLayoutEffect(() => {
  if (cursorRef.current) {
   const cursorRect =
    cursorRef.current.getBoundingClientRect();
   setTargetCursorXPos(cursorRect.left);
   setTargetCursorYPos(cursorRect.top);
  }
 }, [currentWord]);

 let text = [
  <span className="text-neutral-200">
   {props.phrase.slice(0, props.lockedCharacterIndex)}
  </span>,
 ];

 for (let i = 0; i < currentWord.length; i++) {
  if (
   currentWord[i] !==
   props.phrase[props.lockedCharacterIndex + i]
  ) {
   text.push(
    <span className="text-rose-400">
     {props.phrase[props.lockedCharacterIndex + i]}
    </span>
   );
  } else {
   text.push(
    <span className="text-gray-100">{currentWord[i]}</span>
   );
  }
 }

 text.push(<span ref={cursorRef} key="cursor" />);

 let remainingText = props.phrase.slice(
  props.lockedCharacterIndex + currentWord.length
 );
 text.push(
  <span className="text-gray-500">
   {remainingText.slice(currentWord.length)}
  </span>
 );

 return (
  <div className="relative ap">
   <div className="text-2xl max-w-5xl vscode-font tracking-normal p-2">
    <div ref={phraseRef}>{text}</div>
    <input
     value={currentWord}
     onChange={handleInput}
     className="w-full bg-transparent outline-none typebox"
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
     autoFocus
    />
    <div
     className={`bg-white h-[24px] w-[2px] fixed rounded ${
      cursorPulsing ? "animate-pulse-full" : ""
     }`}
     style={{
      top: cursorYPos,
      left: cursorXPos,
     }}
    />
   </div>
  </div>
 );
};
