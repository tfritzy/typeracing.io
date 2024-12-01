import React, { RefObject, useEffect, useState } from "react";
import { KeyStroke } from "../compiled";

function lerp(start: number, end: number, alpha: number) {
  return start + (end - start) * alpha;
}

const cursorYOffset = 2;
const cursorXOffset = -2;
const cursorStartPos = -100;

type CursorProps = {
  targetObject: RefObject<HTMLSpanElement>;
  pulsing: boolean;
  disabled: boolean;
  currentWord: string;
  phrase: string;
};

const Cursor = (props: CursorProps) => {
  const [cursorXPos, setCursorXPos] = useState(cursorStartPos);
  const [cursorYPos, setCursorYPos] = useState(cursorStartPos);
  const [targetCursorXPos, setTargetCursorXPos] = useState(cursorStartPos);
  const [targetCursorYPos, setTargetCursorYPos] = useState(cursorStartPos);

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

      if (props.targetObject.current) {
        const cursorRect = props.targetObject.current.getBoundingClientRect();
        setTargetCursorXPos(cursorRect.left + cursorXOffset);
        setTargetCursorYPos(cursorRect.top + cursorYOffset);
      }

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
      className={`h-[20px] w-[1px] bg-base-100 fixed ${
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
  isLocked: boolean;
  onFirstKeystroke?: () => void;
};

export const TypeBox = (props: TypeBoxProps) => {
  const { phrase, lockedCharacterIndex, onWordComplete, isLocked } = props;
  const [focused, setFocused] = useState(true);
  const [currentWord, setCurrentWord] = useState("");
  const [inputWidth, setInputWidth] = useState(0);
  const phraseRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLSpanElement>(null);
  const keyStrokes = React.useRef<{
    compositeSize: number;
    strokes: KeyStroke[];
  }>({ compositeSize: 0, strokes: [] });
  const wordErrorsCount = React.useRef<number>(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [cursorPulsing, setCursorPinging] = useState(true);
  const setPingingRef = React.useRef<NodeJS.Timeout | null>();

  useEffect(() => {
    if (phraseRef.current) {
      setInputWidth(phraseRef.current.clientWidth);
    }
  }, [phrase, phraseRef.current?.clientWidth]);

  const ignorePaste = React.useCallback((event: any) => {
    event.preventDefault();
  }, []);

  const onFocus = React.useCallback((event: any) => {
    setFocused(true);
  }, []);

  const onBlur = React.useCallback((event: any) => {
    setFocused(false);
  }, []);

  const ignoreArrows = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
    }
  }, []);

  const { text, hasError } = React.useMemo(() => {
    let text = [
      <span className="text-base-100">
        {phrase.slice(0, lockedCharacterIndex)}
      </span>,
    ];

    let hasError = false;
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] !== phrase[lockedCharacterIndex + i]) {
        hasError = true;
        text.push(
          <span className="relative underline underline-offset-[4px]">
            <span className="text-error-color">
              {phrase[lockedCharacterIndex + i]}
            </span>
            <span
              className="absolute text-error-color top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                opacity: phrase[lockedCharacterIndex + i] === " " ? 1 : 0.25,
              }}
            >
              {currentWord[i]}
            </span>
          </span>
        );
      } else {
        text.push(
          <span className="underline underline-offset-[4px] text-base-100">
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
    nextSpaceIndex = nextSpaceIndex === -1 ? phrase.length : nextSpaceIndex;
    const remainderOfWord = phrase.slice(
      lockedCharacterIndex + currentWord.length,
      nextSpaceIndex
    );
    text.push(
      <span className="underline underline-offset-[4px] text-base-500">
        {remainderOfWord}
      </span>
    );

    if (nextSpaceIndex !== -1) {
      let remainingText = phrase.slice(nextSpaceIndex);
      text.push(<span className="text-base-500">{remainingText}</span>);
    }

    return { text, hasError };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord]);

  const showFixAll = hasError && currentWord.length > 12;

  const handleInput = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isLocked) {
        return;
      }

      if (currentWord.length === 0 && lockedCharacterIndex === 0) {
        props.onFirstKeystroke && props.onFirstKeystroke();
      }

      if (currentWord.length < event.target.value.length) {
        const gotCharCorrect = event.target.value.endsWith(
          event.target.value.slice(-1)
        );
        if (!gotCharCorrect) {
          wordErrorsCount.current++;
        }
      }

      if (
        hasError &&
        currentWord.length > 20 &&
        event.target.value.length > currentWord.length
      ) {
        return;
      }

      if (event.target.value.length + lockedCharacterIndex > phrase.length) {
        return;
      }

      setCurrentWord(event.target.value);
    },
    [
      currentWord.length,
      hasError,
      lockedCharacterIndex,
      phrase.length,
      isLocked,
      props.onFirstKeystroke,
    ]
  );

  useEffect(() => {
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

    while (keyStrokes.current.compositeSize > currentWord.length) {
      keyStrokes.current.strokes.push({
        character: "\b",
        time: Date.now() / 1000,
      });
      keyStrokes.current.compositeSize--;
    }

    while (keyStrokes.current.compositeSize < currentWord.length) {
      keyStrokes.current.strokes.push({
        character: currentWord[keyStrokes.current.compositeSize],
        time: Date.now() / 1000,
      });
      keyStrokes.current.compositeSize++;
    }

    let correctUpToIndex = lockedCharacterIndex;
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] !== phrase[lockedCharacterIndex + i]) {
        break;
      }
      correctUpToIndex++;
    }

    const correctSubstring = phrase.slice(
      lockedCharacterIndex,
      correctUpToIndex
    );
    let newEndIndex = -1;
    if (
      correctUpToIndex - lockedCharacterIndex > 0 &&
      (correctSubstring.includes(" ") || correctUpToIndex === phrase.length)
    ) {
      newEndIndex = correctUpToIndex;
    }

    if (newEndIndex !== -1) {
      onWordComplete(
        newEndIndex,
        keyStrokes.current.strokes,
        wordErrorsCount.current
      );
      setCurrentWord("");
      wordErrorsCount.current = 0;
      keyStrokes.current.strokes = [];
      keyStrokes.current.compositeSize = 0;
    }
  }, [currentWord, lockedCharacterIndex, onWordComplete, phrase]);

  const refocusMessage = React.useMemo(() => {
    return (
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-[50%] -translate-y-[50%] cursor-pointer transition-opacity pointer-events-none text-base w-max text-base-200"
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
    <div className="relative select-none">
      <div className="text-2xl type-box">
        <div
          className="rounded-lg transition-colors whitespace-pre-wrap"
          style={{
            filter: focused ? "blur(0)" : "blur(2px)",
            opacity: focused && !isLocked ? 1 : 0.5,
          }}
          ref={phraseRef}
        >
          {text}
        </div>
        {refocusMessage}
        {errorBorder}
        <input
          value={currentWord}
          onPaste={ignorePaste}
          onChange={handleInput}
          onKeyDown={ignoreArrows}
          id="type-box"
          className="w-full min-h-full outline-none typebox rounded-lg absolute top-0 left-0 bg-transparent text-transparent"
          ref={inputRef}
          autoCorrect="false"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          style={{
            width: `${inputWidth}px`,
            cursor: !focused ? "pointer" : "auto",
            outline: "none",
          }}
          autoFocus
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <Cursor
          disabled={!focused || lockedCharacterIndex >= phrase.length}
          pulsing={cursorPulsing}
          targetObject={cursorRef}
          currentWord={currentWord}
          phrase={phrase}
        />
      </div>
      {showFixAll && (
        <div
          className="absolute -top-4 text-error-color text-lg w-full text-center"
          style={{ lineHeight: 0 }}
        >
          You must fix all errors
        </div>
      )}
    </div>
  );
};
