import React, { RefObject, useEffect, useState } from "react";
import { GoLabel } from "./GoLabel";
import { KeyStroke } from "./compiled";

function lerp(start: number, end: number, alpha: number) {
  return start + (end - start) * alpha;
}

const cursorYOffset = 2;
const cursorXOffset = -1;

type CursorProps = {
  targetObject: RefObject<HTMLSpanElement>;
  pulsing: boolean;
  disabled: boolean;
  currentWord: string;
  phrase: string;
};

const Cursor = (props: CursorProps) => {
  const [cursorXPos, setCursorXPos] = useState(0);
  const [cursorYPos, setCursorYPos] = useState(0);
  const [targetCursorXPos, setTargetCursorXPos] = useState(0);
  const [targetCursorYPos, setTargetCursorYPos] = useState(0);

  const resetPos = React.useCallback(() => {
    if (props.targetObject.current) {
      const cursorRect = props.targetObject.current.getBoundingClientRect();
      setTargetCursorXPos(cursorRect.left + cursorXOffset);
      setTargetCursorYPos(cursorRect.top + cursorYOffset);
      setCursorXPos(cursorRect.left + cursorXOffset);
      setCursorYPos(cursorRect.top + cursorYOffset);
    }
  }, [props.targetObject]);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      setCursorXPos((prevX) => lerp(prevX, targetCursorXPos, 0.4));
      setCursorYPos((prevY) => lerp(prevY, targetCursorYPos, 0.4));

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

    return () => window.removeEventListener("resize", handleResize);
  }, [resetPos]);

  useEffect(() => {
    if (props.targetObject.current) {
      const cursorRect = props.targetObject.current.getBoundingClientRect();
      setTargetCursorXPos(cursorRect.left + cursorXOffset);
      setTargetCursorYPos(cursorRect.top + cursorYOffset);
    }
  }, [props.currentWord]);

  useEffect(() => {
    if (props.targetObject.current) {
      const cursorRect = props.targetObject.current.getBoundingClientRect();
      setTargetCursorXPos(cursorRect.left + cursorXOffset);
      setTargetCursorYPos(cursorRect.top + cursorYOffset);
      setCursorXPos(cursorRect.left + cursorXOffset);
      setCursorYPos(cursorRect.top + cursorYOffset);
    }
  }, [props.targetObject.current]);

  useEffect(() => {
    if (props.targetObject.current) {
      const cursorRect = props.targetObject.current.getBoundingClientRect();
      setTargetCursorXPos(cursorRect.left + cursorXOffset);
      setTargetCursorYPos(cursorRect.top + cursorYOffset);
      setCursorXPos(cursorRect.left + cursorXOffset);
      setCursorYPos(cursorRect.top + cursorYOffset);
    }
  }, [props.phrase]);

  return (
    <span
      className={`h-[26px] w-[2px] rounded-full bg-text-primary fixed ${
        props.pulsing ? "cursor" : ""
      }`}
      style={{
        top: cursorYPos,
        left: cursorXPos,
      }}
      hidden={props.disabled}
    />
  );
};

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
  const { phrase, lockedCharacterIndex, onWordComplete, startTime } = props;
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
  const [cursorPulsing, setCursorPinging] = useState(true);
  const setPingingRef = React.useRef<NodeJS.Timeout | null>();

  useEffect(() => {
    if (phraseRef.current) {
      setInputWidth(phraseRef.current.clientWidth);
    }
  }, [phrase, phraseRef.current?.clientWidth]);

  const ignoreArrows = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
    }
  }, []);

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

    while (keyStrokes.current.length > currentWord.length) {
      keyStrokes.current.strokes.push({
        character: "\b",
        time: (Date.now() - props.startTime) / 1000,
      });
      keyStrokes.current.length--;
    }

    while (keyStrokes.current.length < currentWord.length) {
      keyStrokes.current.strokes.push({
        character: currentWord[currentWord.length - 1],
        time: (Date.now() - props.startTime) / 1000,
      });
      keyStrokes.current.length++;
    }

    if (
      currentWord.includes(" ") ||
      lockedCharacterIndex + currentWord.length === phrase.length
    ) {
      const word = phrase.slice(lockedCharacterIndex).split(" ")[0];
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
    props.startTime,
  ]);

  useEffect(() => {
    handleWordUpdate();
  }, [currentWord, handleWordUpdate, startTime]);

  const { text, hasError } = React.useMemo(() => {
    let text = [
      <span className="text-text-primary">
        {phrase.slice(0, lockedCharacterIndex)}
      </span>,
    ];

    let hasError = false;
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] !== phrase[lockedCharacterIndex + i]) {
        hasError = true;
        text.push(
          <span className="text-error-color underline">
            {phrase[lockedCharacterIndex + i]}
          </span>
        );
      } else {
        text.push(
          <span className="underline text-text-primary">{currentWord[i]}</span>
        );
      }
    }

    text.push(<span ref={cursorRef} key="cursor" />);

    let nextSpaceIndex = phrase.indexOf(
      " ",
      lockedCharacterIndex + currentWord.length
    );
    nextSpaceIndex = nextSpaceIndex === -1 ? phrase.length : nextSpaceIndex;
    const remainderOfWord = phrase.slice(
      lockedCharacterIndex + currentWord.length,
      nextSpaceIndex
    );
    text.push(
      <span className="underline text-text-tertiary">{remainderOfWord}</span>
    );

    if (nextSpaceIndex !== -1) {
      let remainingText = phrase.slice(nextSpaceIndex);
      text.push(<span className="text-text-tertiary">{remainingText}</span>);
    }

    return { text, hasError };
  }, [currentWord, lockedCharacterIndex, phrase]);

  const refocusMessage = React.useMemo(() => {
    return (
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-[50%] -translate-y-[50%] cursor-pointer transition-opacity pointer-events-none text-base w-max text-text-secondary"
        style={{
          opacity: !focused ? 1 : 0,
        }}
      >
        Click or press 't' to focus
      </div>
    );
  }, [focused]);

  const errorBorder = React.useMemo(() => {
    return (
      <div
        style={{
          opacity: hasError ? 1 : 0,
          width: "calc(100% + 20px)",
          height: "calc(100% + 10px)",
          left: -10,
          top: -5,
        }}
        className="absolute border border-error-color rounded-lg z-[-1] transition-opacity"
      />
    );
  }, [hasError]);

  return (
    <div className="relative">
      <div className="text-2xl type-box">
        <div
          className="rounded-lg transition-colors whitespace-pre-wrap"
          style={{
            filter: focused ? "blur(0)" : "blur(2px)",
            opacity: focused && Date.now() - startTime > 0 ? 1 : 0.5,
          }}
          ref={phraseRef}
        >
          {text}
        </div>
        {refocusMessage}
        {errorBorder}
        <input
          value={currentWord}
          onPaste={(e) => e.preventDefault()}
          onChange={handleInput}
          onKeyDown={ignoreArrows}
          id="type-box"
          className="w-full outline-none typebox rounded-lg absolute top-0 left-0 bg-transparent text-transparent max-w-full max-h-full h-full"
          ref={inputRef}
          autoCorrect="false"
          autoCapitalize="none"
          autoComplete="false"
          spellCheck={false}
          style={{
            width: `${inputWidth}px`,
            cursor: !focused ? "pointer" : "auto",
            outline: "none",
          }}
          autoFocus
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Cursor
          disabled={!focused || lockedCharacterIndex >= phrase.length}
          pulsing={cursorPulsing}
          targetObject={cursorRef}
          currentWord={currentWord}
          phrase={phrase}
        />
      </div>

      <div className="absolute -left-16 top-2">
        <GoLabel startTime={startTime} />
      </div>
    </div>
  );
};
