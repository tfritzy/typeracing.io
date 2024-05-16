import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  AccentColor,
  BrandColor,
  NeutralColor,
  SecondaryTextColor,
  TertiaryTextColor,
  TextColor,
} from "./constants";
import { CursorPointer } from "iconoir-react";

function lerp(start: number, end: number, alpha: number) {
  return start + (end - start) * alpha;
}

type TypeBoxProps = {
  phrase: string;
  lockedCharacterIndex: number;
  onWordComplete: (charIndex: number, charCompletionTimes: number[]) => void;
  startTime: number;
};

export const TypeBox = (props: TypeBoxProps) => {
  const [focused, setFocused] = useState(true);
  const [currentWord, setCurrentWord] = useState("");
  const [inputWidth, setInputWidth] = useState(0);
  const phraseRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLSpanElement>(null);
  const charTimes = React.useRef<number[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [cursorXPos, setCursorXPos] = useState(0);
  const [cursorYPos, setCursorYPos] = useState(0);
  const [targetCursorXPos, setTargetCursorXPos] = useState(0);
  const [targetCursorYPos, setTargetCursorYPos] = useState(0);
  const [cursorPulsing, setCursorPinging] = useState(true);
  const setPingingRef = React.useRef<NodeJS.Timeout | null>();
  const [timeTillStart, setTimeTillStart] = useState<number | null>(null);

  const resetPos = React.useCallback(() => {
    if (cursorRef.current) {
      const cursorRect = cursorRef.current.getBoundingClientRect();
      setTargetCursorXPos(cursorRect.left);
      setTargetCursorYPos(cursorRect.top + 6);
      setCursorXPos(cursorRect.left);
      setCursorYPos(cursorRect.top + 6);
    }
  }, []);

  useEffect(() => {
    if (phraseRef.current) {
      setInputWidth(phraseRef.current.clientWidth);
    }

    resetPos();
  }, [props.phrase, phraseRef.current?.clientWidth]);

  const handleInput = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (Date.now() - props.startTime < 0) {
        return;
      }

      setCurrentWord(event.target.value);
    },
    [props.startTime]
  );

  const handleWordUpdate = () => {
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

    while (charTimes.current.length < currentWord.length) {
      charTimes.current.push((Date.now() - props.startTime) / 1000);
    }
    while (charTimes.current.length > currentWord.length) {
      charTimes.current.pop();
    }

    if (
      currentWord.endsWith(" ") ||
      props.lockedCharacterIndex + currentWord.length === props.phrase.length
    ) {
      const word = props.phrase.slice(props.lockedCharacterIndex).split(" ")[0];
      if (word === currentWord.trim()) {
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
    handleWordUpdate();
  }, [currentWord, props.startTime]);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      setCursorXPos((prevX) => lerp(prevX, targetCursorXPos, 0.5));
      setCursorYPos((prevY) => lerp(prevY, targetCursorYPos, 0.5));

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [targetCursorXPos, targetCursorYPos]);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      const timeTillStart = props.startTime - Date.now();
      if (timeTillStart <= 0) {
        setTimeTillStart(null);
      } else {
        frameId = requestAnimationFrame(animate);
        setTimeTillStart(Math.max(0, (props.startTime - Date.now()) / 1000));
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [props.startTime]);

  useEffect(() => {
    function handleResize() {
      resetPos();
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (cursorRef.current) {
      const cursorRect = cursorRef.current.getBoundingClientRect();
      setCursorXPos(cursorRect.left);
      setCursorYPos(cursorRect.top);
    }
  }, []);

  useLayoutEffect(() => {
    if (cursorRef.current) {
      const cursorRect = cursorRef.current.getBoundingClientRect();
      setTargetCursorXPos(cursorRect.left);
      setTargetCursorYPos(cursorRect.top + 5);
    }
  }, [currentWord]);

  let text = [
    <span style={{ color: TextColor }}>
      {props.phrase.slice(0, props.lockedCharacterIndex)}
    </span>,
  ];

  let hasError = false;
  for (let i = 0; i < currentWord.length; i++) {
    if (currentWord[i] !== props.phrase[props.lockedCharacterIndex + i]) {
      hasError = true;
      text.push(
        <span className="text-red-500 underline">
          {props.phrase[props.lockedCharacterIndex + i]}
        </span>
      );
    } else {
      text.push(<span style={{ color: TextColor }}>{currentWord[i]}</span>);
    }
  }

  text.push(<span ref={cursorRef} key="cursor" />);

  let remainingText = props.phrase.slice(
    props.lockedCharacterIndex + currentWord.length
  );
  text.push(<span style={{ color: TertiaryTextColor }}>{remainingText}</span>);

  return (
    <div className="relative">
      <div className="text-2xl type-box">
        <div
          className="rounded-lg transition-colors"
          style={{
            whiteSpace: "pre-wrap",
            filter: focused ? "blur(0)" : "blur(2px)",
            opacity: focused ? 1 : 0.5,
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
            className="absolute bg-[#ff000006] border border-red-800 rounded-lg z-[-1] transition-opacity"
          />
        }
        <input
          value={currentWord}
          onChange={handleInput}
          id="type-box"
          className="w-full outline-none typebox rounded-lg"
          ref={inputRef}
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
          className={`h-[32px] w-[1px] fixed ${
            cursorPulsing ? "animate-pulse-full" : ""
          }`}
          style={{
            top: cursorYPos,
            left: cursorXPos,
            backgroundColor: AccentColor,
          }}
          hidden={!focused || props.lockedCharacterIndex >= props.phrase.length}
        />
      </div>

      {timeTillStart !== null && (
        <div
          className="absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%] text-lg text-gray-400 rounded-full p-3"
          style={{ backgroundColor: NeutralColor }}
        >
          <div className="flex flex-row space-x-2 relative">
            <div
              style={{ opacity: timeTillStart < 4.5 ? 1 : 0.1 }}
              className="bg-neutral-300 w-5 h-5 rounded-full"
            />
            <div
              style={{ opacity: timeTillStart < 3 ? 1 : 0.1 }}
              className="bg-neutral-300 w-5 h-5 rounded-full"
            />
            <div
              style={{ opacity: timeTillStart < 1.5 ? 1 : 0.1 }}
              className="bg-green-400 w-5 h-5 rounded-full"
            />
            <div
              className="absoulte top-0 left-0 h-full rounded-full"
              style={{
                width: `${(1 - timeTillStart / 5) * 100}%`,
                backgroundColor: BrandColor,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
