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
 startTime: number;
};

export const TypeBox = (props: TypeBoxProps) => {
 const [currentWord, setCurrentWord] = useState("");
 const [inputWidth, setInputWidth] = useState(0);
 const phraseRef = React.useRef<HTMLDivElement>(null);
 const cursorRef = React.useRef<HTMLSpanElement>(null);
 const charTimes = React.useRef<number[]>([]);
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

  if (cursorRef.current) {
   const cursorRect =
    cursorRef.current.getBoundingClientRect();
   setTargetCursorXPos(cursorRect.left);
   setTargetCursorYPos(cursorRect.top + 5);
   setCursorXPos(cursorRect.left);
   setCursorYPos(cursorRect.top);
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

  const currentWord = event.target.value;
  setCurrentWord(event.target.value);
  while (
   charTimes.current.length < event.target.value.length
  ) {
   charTimes.current.push(
    (Date.now() - props.startTime) / 1000
   );
  }
  while (
   charTimes.current.length > event.target.value.length
  ) {
   charTimes.current.pop();
  }

  console.log(currentWord);
  if (
   event.target.value.endsWith(" ") ||
   props.lockedCharacterIndex + currentWord.length ===
    props.phrase.length
  ) {
   const word = props.phrase
    .slice(props.lockedCharacterIndex)
    .split(" ")[0];
   console.log("Checking word matched", word, currentWord);
   if (word === currentWord.trim()) {
    console.log(
     "Completed word",
     currentWord,
     charTimes.current
    );
    props.onWordComplete(
     props.lockedCharacterIndex + currentWord.length,
     charTimes.current
    );
    setCurrentWord("");
    charTimes.current = [];
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
   setTargetCursorYPos(cursorRect.top + 5);
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
    <span className="text-red-500 underline">
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
  <span className="text-gray-500">{remainingText}</span>
 );

 return (
  <div className="relative ap">
   <div className="text-2xl max-w-5xl font-thin vscode-font tracking-normal p-2">
    <div style={{ whiteSpace: "pre-wrap" }} ref={phraseRef}>
     {text}
    </div>
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
     className={`bg-white h-[24px] w-[1px] fixed ${
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
