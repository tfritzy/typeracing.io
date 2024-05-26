import React, {
 useEffect,
 useLayoutEffect,
 useState,
} from "react";
import {
 AccentColor,
 SecondaryTextColor,
 TertiaryTextColor,
 TextColor,
} from "./constants";
import { GoLabel } from "./GoLabel";
import { KeyStroke } from "./compiled";

function lerp(start: number, end: number, alpha: number) {
 return start + (end - start) * alpha;
}

const cursorYOffset = 2;

type TypeBoxProps = {
 phrase: string;
 lockedCharacterIndex: number;
 onWordComplete: (
  charIndex: number,
  keyStrokes: KeyStroke[],
  errorCount: number
 ) => void;
 startTime: number;
};

export const TypeBox = (props: TypeBoxProps) => {
 const {
  phrase,
  lockedCharacterIndex,
  onWordComplete,
  startTime,
 } = props;
 const [focused, setFocused] = useState(true);
 const [currentWord, setCurrentWord] = useState("");
 const [inputWidth, setInputWidth] = useState(0);
 const phraseRef = React.useRef<HTMLDivElement>(null);
 const cursorRef = React.useRef<HTMLSpanElement>(null);
 const keyStrokes = React.useRef<{
  length: number;
  strokes: KeyStroke[];
 }>({ length: 0, strokes: [] });
 const wordErrorsCount = React.useRef<number>(0);
 const inputRef = React.useRef<HTMLInputElement>(null);
 const [cursorXPos, setCursorXPos] = useState(0);
 const [cursorYPos, setCursorYPos] = useState(0);
 const [targetCursorXPos, setTargetCursorXPos] =
  useState(0);
 const [targetCursorYPos, setTargetCursorYPos] =
  useState(0);
 const [cursorPulsing, setCursorPinging] = useState(true);
 const setPingingRef =
  React.useRef<NodeJS.Timeout | null>();

 const resetPos = React.useCallback(() => {
  if (cursorRef.current) {
   const cursorRect =
    cursorRef.current.getBoundingClientRect();
   setTargetCursorXPos(cursorRect.left);
   setTargetCursorYPos(cursorRect.top + cursorYOffset);
   setCursorXPos(cursorRect.left);
   setCursorYPos(cursorRect.top + cursorYOffset);
  }
 }, []);

 useEffect(() => {
  if (phraseRef.current) {
   setInputWidth(phraseRef.current.clientWidth);
  }

  resetPos();
 }, [phrase, phraseRef.current?.clientWidth, resetPos]);

 const handleInput = React.useCallback(
  (event: React.ChangeEvent<HTMLInputElement>) => {
   if (Date.now() - startTime < 0) {
    return;
   }

   if (currentWord.length < event.target.value.length) {
    const gotCharCorrect = event.target.value.endsWith(
     event.target.value.slice(-1)
    );
    if (!gotCharCorrect) {
     wordErrorsCount.current++;
    }
   }

   setCurrentWord(event.target.value);
  },
  [currentWord.length, startTime]
 );

 const handleWordUpdate = React.useCallback(() => {
  if (lockedCharacterIndex >= phrase.length) {
   return;
  }

  setCursorPinging(false);
  if (setPingingRef.current) {
   clearTimeout(setPingingRef.current);
  }
  setPingingRef.current = setTimeout(() => {
   setCursorPinging(true);
  }, 1000);

  while (keyStrokes.current.length < currentWord.length) {
   keyStrokes.current.strokes.push({
    character: currentWord[currentWord.length - 1],
    time: (Date.now() - props.startTime) / 1000,
   });
   keyStrokes.current.length++;
  }

  while (keyStrokes.current.length > currentWord.length) {
   keyStrokes.current.strokes.push({
    character: "\b",
    time: (Date.now() - props.startTime) / 1000,
   });
   keyStrokes.current.length--;
  }

  if (
   currentWord.endsWith(" ") ||
   lockedCharacterIndex + currentWord.length ===
    phrase.length
  ) {
   const word = phrase
    .slice(lockedCharacterIndex)
    .split(" ")[0];
   if (word === currentWord.trim()) {
    onWordComplete(
     lockedCharacterIndex + currentWord.length,
     keyStrokes.current.strokes,
     wordErrorsCount.current
    );
    setCurrentWord("");
    wordErrorsCount.current = 0;
    keyStrokes.current.strokes = [];
    keyStrokes.current.length = 0;
   }
  }
 }, [
  currentWord,
  lockedCharacterIndex,
  onWordComplete,
  phrase,
 ]);

 useEffect(() => {
  handleWordUpdate();
 }, [currentWord, handleWordUpdate, startTime]);

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
  function handleResize() {
   resetPos();
  }

  window.addEventListener("resize", handleResize);
  handleResize();

  return () =>
   window.removeEventListener("resize", handleResize);
 }, [resetPos]);

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
   setTargetCursorYPos(cursorRect.top + cursorYOffset);
  }
 }, [currentWord]);

 const { text, hasError } = React.useMemo(() => {
  let text = [
   <span style={{ color: TextColor }}>
    {phrase.slice(0, lockedCharacterIndex)}
   </span>,
  ];

  let hasError = false;
  for (let i = 0; i < currentWord.length; i++) {
   if (
    currentWord[i] !== phrase[lockedCharacterIndex + i]
   ) {
    hasError = true;
    text.push(
     <span className="text-red-500 underline">
      {phrase[lockedCharacterIndex + i]}
     </span>
    );
   } else {
    text.push(
     <span
      className=""
      style={{
       color: TextColor,
       textDecorationColor: AccentColor,
      }}
     >
      {currentWord[i]}
     </span>
    );
   }
  }

  text.push(<span ref={cursorRef} key="cursor" />);

  let nextSpaceIndex = phrase.indexOf(
   " ",
   lockedCharacterIndex + currentWord.length
  );
  nextSpaceIndex =
   nextSpaceIndex === -1 ? phrase.length : nextSpaceIndex;
  const remainderOfWord = phrase.slice(
   lockedCharacterIndex + currentWord.length,
   nextSpaceIndex
  );
  text.push(
   <span
    className=""
    style={{
     color: TertiaryTextColor,
     textDecorationColor: AccentColor + "70",
    }}
   >
    {remainderOfWord}
   </span>
  );

  if (nextSpaceIndex !== -1) {
   let remainingText = phrase.slice(nextSpaceIndex);
   text.push(
    <span style={{ color: TertiaryTextColor }}>
     {remainingText}
    </span>
   );
  }

  return { text, hasError };
 }, [currentWord, lockedCharacterIndex, phrase]);

 return (
  <div className="relative">
   <div className="text-2xl type-box">
    <div
     className="rounded-lg transition-colors"
     style={{
      whiteSpace: "pre-wrap",
      filter: focused ? "blur(0)" : "blur(2px)",
      opacity:
       focused && Date.now() - startTime > 0 ? 1 : 0.5,
     }}
     ref={phraseRef}
    >
     {text}
    </div>
    {
     <div
      className="absolute top-1/2 left-1/2 transform -translate-x-[50%] -translate-y-[50%] cursor-pointer transition-opacity pointer-events-none text-base w-max"
      style={{
       opacity: !focused ? 1 : 0,
       color: SecondaryTextColor,
      }}
     >
      Click or press 't' to focus
     </div>
    }
    {
     <div
      style={{
       opacity: hasError ? 1 : 0,
       width: "calc(100% + 20px)",
       height: "calc(100% + 10px)",
       left: -10,
       top: -5,
      }}
      className="absolute bg-[#ff000004] border border-red-950 rounded-lg z-[-1] transition-opacity"
     />
    }
    <input
     value={currentWord}
     onChange={handleInput}
     id="type-box"
     className="w-full outline-none typebox rounded-lg"
     ref={inputRef}
     autoCorrect="off"
     autoCapitalize="none"
     autoComplete="off"
     spellCheck={false}
     style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: `${inputWidth}px`,
      maxWidth: "100%",
      height: "100%",
      background: "transparent",
      color: "transparent",
      cursor: !focused ? "pointer" : "auto",
      outline: "none",
     }}
     autoFocus
     onFocus={() => setFocused(true)}
     onBlur={() => setFocused(false)}
    />
    <div
     className={`h-[26px] w-[1px] fixed ${
      cursorPulsing ? "cursor" : ""
     }`}
     style={{
      top: cursorYPos,
      left: cursorXPos,
      backgroundColor: AccentColor,
     }}
     hidden={
      !focused || lockedCharacterIndex >= phrase.length
      //  || Date.now() - startTime < 0
     }
    />
   </div>

   <div className="absolute -left-16 top-2">
    <GoLabel startTime={startTime} />
   </div>
  </div>
 );
};
