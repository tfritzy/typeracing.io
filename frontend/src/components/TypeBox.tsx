import React, { useEffect, useState } from "react";
import { KeyStroke } from "../stats";
import { Cursor } from "./Cursor";
import { Timestamp } from "@shared/types";
import { Timestamp as FSTimestamp } from "firebase/firestore";

type TypeBoxProps = {
  phrase: string;
  onWordComplete?: (charIndex: number, keystrokes: KeyStroke[]) => void;
  onPhraseComplete?: (keystrokes: KeyStroke[], errorCount: number) => void;
  isLocked: boolean;
  onFirstKeystroke?: () => void;
  getNow: () => Timestamp;
  startTime: Timestamp;
};

export const TypeBox = ({
  phrase,
  onWordComplete,
  onPhraseComplete,
  isLocked,
  onFirstKeystroke,
  getNow,
  startTime,
}: TypeBoxProps) => {
  const [focused, setFocused] = useState(true);
  const [input, setInput] = useState("");
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
  const setPingingRef = React.useRef<ReturnType<typeof setTimeout> | null>();

  useEffect(() => {
    if (phraseRef.current) {
      setInputWidth(phraseRef.current.clientWidth);
    }
  }, [phrase, phraseRef.current?.clientWidth]);

  const ignorePaste = React.useCallback((event: React.ClipboardEvent) => {
    event.preventDefault();
  }, []);

  const onFocus = React.useCallback(() => {
    setFocused(true);
  }, []);

  const onBlur = React.useCallback(() => {
    setFocused(false);
  }, []);

  const ignoreArrows = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
    }
  }, []);

  const { text, showFixAll } = React.useMemo(() => {
    const [checkpoint, nextCheckpoint] = getCheckpoints(input, phrase);

    const text = [
      <span className="text-base-600" key="fin">
        {phrase.slice(0, checkpoint)}
      </span>,
    ];

    let extraCount = 0;
    for (let i = checkpoint; i < input.length; i++) {
      if (i >= nextCheckpoint) {
        text.push(
          <span className="text-error opacity-50" key={"extra-" + i}>
            {input[i]}
          </span>
        );
        extraCount += 1;
      } else if (input[i] === phrase[i]) {
        text.push(
          <span className="text-base-200" key={"prog-" + i}>
            {input[i]}
          </span>
        );
      } else {
        text.push(
          <span className="text-error" key={"error" + i}>
            {phrase[i]}
          </span>
        );
      }
    }

    text.push(<span ref={cursorRef} key="cur" />);

    text.push(
      <span className="text-base-400" key="restCheck">
        {phrase.slice(input.length, nextCheckpoint)}
      </span>
    );

    text.push(
      <span className="text-base-400" key="rest">
        {phrase.slice(nextCheckpoint, phrase.length)}
      </span>
    );

    return { text, showFixAll: extraCount >= 5 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const handleInput = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isLocked) {
        return;
      }

      if (input.length === 0) {
        onFirstKeystroke?.();
      }

      const [iCheckpoint, iNextCheckpoint] = getCheckpoints(input, phrase);
      const [eCheckpoint] = getCheckpoints(event.target.value, phrase);

      const maxCheckpoint = Math.max(iCheckpoint, eCheckpoint);

      if (iCheckpoint >= phrase.length) {
        return;
      }

      if (event.target.value.length > iNextCheckpoint + 10) {
        return;
      }

      setCursorPinging(false);
      if (setPingingRef.current) {
        clearTimeout(setPingingRef.current);
      }
      setPingingRef.current = setTimeout(() => {
        setCursorPinging(true);
      }, 1000);

      if (event.target.value.length <= maxCheckpoint) {
        event.target.value = phrase.substring(
          0,
          maxCheckpoint === 0 ? maxCheckpoint : maxCheckpoint + 1
        );
      }

      const now = getNow();
      let seconds = now.seconds - startTime.seconds;
      let nanoseconds = now.nanoseconds - startTime.nanoseconds;

      if (nanoseconds < 0) {
        seconds -= 1;
        nanoseconds += 1e9;
      }

      const timestamp = new FSTimestamp(seconds, nanoseconds);
      if (event.target.value.length > input.length) {
        for (let i = input.length; i < event.target.value.length; i++) {
          keyStrokes.current.strokes.push({
            character: event.target.value[i],
            time: timestamp,
          });
        }
      } else {
        for (let i = input.length; i > event.target.value.length; i--) {
          keyStrokes.current.strokes.push({ character: "\b", time: timestamp });
        }
      }

      if (eCheckpoint > iCheckpoint) {
        onWordComplete?.(eCheckpoint, keyStrokes.current.strokes);
      }

      if (eCheckpoint >= phrase.length) {
        onPhraseComplete?.(keyStrokes.current.strokes, wordErrorsCount.current);
      }

      setInput(event.target.value);
    },
    [
      isLocked,
      input,
      phrase,
      getNow,
      startTime.seconds,
      startTime.nanoseconds,
      onFirstKeystroke,
      onWordComplete,
      onPhraseComplete,
    ]
  );

  const refocusMessage = React.useMemo(() => {
    return (
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-[50%] -translate-y-[50%] cursor-pointer transition-opacity pointer-events-none text-stone w-max text-base-200 text-sm"
        style={{
          opacity: !focused ? 1 : 0,
        }}
      >
        Click or press 't' to focus
      </div>
    );
  }, [focused]);

  return (
    <div className="relative select-none">
      <div className="text-3xl type-box">
        <div
          className="rounded-lg transition-colors whitespace-pre-wrap text-start"
          style={{
            filter: focused ? "blur(0)" : "blur(2px)",
            opacity: focused && !isLocked ? 1 : 0.5,
          }}
          ref={phraseRef}
        >
          {text}
        </div>
        {refocusMessage}
        <input
          value={input}
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
          disabled={!focused || input.length >= phrase.length}
          pulsing={cursorPulsing}
          targetObject={cursorRef}
          input={input}
          phrase={phrase}
        />
      </div>
      {showFixAll && (
        <div
          className="absolute -top-4 text-error text-lg w-full text-center"
          style={{ lineHeight: 0 }}
        >
          You must fix all errors
        </div>
      )}
    </div>
  );
};

function getCheckpoints(input: string, phrase: string): number[] {
  let checkpoint = 0;
  let nextCheckpoint = phrase.length;
  let inFinishedRegion = true;
  for (let i = 0; i <= phrase.length; i++) {
    if (input[i] !== phrase[i]) {
      inFinishedRegion = false;
    }

    if (phrase[i] === " " || i === phrase.length) {
      if (inFinishedRegion) {
        checkpoint = i;
      } else if (nextCheckpoint === phrase.length) {
        nextCheckpoint = i;
        break;
      }
    }
  }

  return [checkpoint, nextCheckpoint];
}
