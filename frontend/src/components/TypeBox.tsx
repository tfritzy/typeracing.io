import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyStroke } from "../stats";
import { Cursor } from "./Cursor";
import { Timestamp } from "@shared/types";
import { Timestamp as FSTimestamp } from "firebase/firestore";
import { getCheckpointsForText } from "../helpers/getCheckpoints";
import { codeToTokens, TokensResult } from "shiki";
import { codePhraseToHtml, textPhraseToHtml } from "../helpers/phraseToHtml";

type TypeBoxProps = {
  phrase: string;
  onWordComplete?: (charIndex: number, keystrokes: KeyStroke[]) => void;
  onPhraseComplete?: (keystrokes: KeyStroke[], errorCount: number) => void;
  isLocked: boolean;
  onFirstKeystroke?: () => void;
  getNow: () => Timestamp;
  startTime: Timestamp;
  isCode: boolean;
};

export const TypeBox = ({
  phrase,
  onWordComplete,
  onPhraseComplete,
  isLocked,
  onFirstKeystroke,
  getNow,
  startTime,
  isCode,
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
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [cursorPulsing, setCursorPinging] = useState(true);
  const setPingingRef = React.useRef<ReturnType<typeof setTimeout> | null>();
  const [tokens, setTokens] = useState<TokensResult | undefined>(undefined);

  useEffect(() => {
    if (phraseRef.current) {
      setInputWidth(phraseRef.current.clientWidth);
    }
  }, [phrase, phraseRef.current?.clientWidth]);

  const preventCursorPosition = useCallback(() => {
    // Always force cursor to end of input
    if (inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, []);

  const ignorePaste = React.useCallback((event: React.ClipboardEvent) => {
    event.preventDefault();
  }, []);

  const onFocus = React.useCallback(() => {
    setFocused(true);
    preventCursorPosition();
  }, [preventCursorPosition]);

  const onBlur = React.useCallback(() => {
    setFocused(false);
    preventCursorPosition();
  }, [preventCursorPosition]);

  React.useEffect(() => {
    if (isCode) {
      codeToTokens(phrase, {
        lang: "csharp",
        theme: "vitesse-dark",
      }).then((tokens) => setTokens(tokens));
    } else {
      setTokens(undefined);
    }
  }, [isCode, phrase]);

  const text = useMemo(() => {
    if (isCode && !tokens) return null;

    return isCode
      ? codePhraseToHtml(phrase, input, tokens!, cursorRef)
      : textPhraseToHtml(phrase, input, cursorRef);
  }, [input, isCode, phrase, tokens]);

  const handleInput = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (isLocked) {
        return;
      }

      if (input.length === 0) {
        onFirstKeystroke?.();
      }

      if (phrase[event.target.value.length - 1] === "\n") {
        while (phrase[event.target.value.length] === " ") {
          event.target.value += " ";
        }
      }

      const [iCheckpoint, iNextCheckpoint] = getCheckpointsForText(
        input,
        phrase
      );
      const [eCheckpoint] = getCheckpointsForText(event.target.value, phrase);
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

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const cursorKeys = [
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "PageUp",
        "PageDown",
      ];

      if (cursorKeys.includes(event.key)) {
        event.preventDefault();
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const newValue = input + "\n";
        const inputEvent = {
          target: {
            value: newValue,
          },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        handleInput(inputEvent);
      }
    },
    [handleInput, input]
  );

  const refocusMessage = React.useMemo(() => {
    return (
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-[50%] -translate-y-[50%] cursor-pointer transition-opacity pointer-events-none w-max text-base-200 text-sm"
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
      <div className="type-box" style={{ fontSize: isCode ? "16pt" : "20pt" }}>
        <div
          className="rounded-lg transition-colors whitespace-pre-wrap text-start language-python"
          style={{
            filter: focused ? "blur(0)" : "blur(2px)",
            opacity: focused && !isLocked ? 1 : 0.5,
          }}
          ref={phraseRef}
        >
          {text}
        </div>
        {refocusMessage}
        <textarea
          value={input}
          onPaste={ignorePaste}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          id="type-box"
          className="w-full min-h-full outline-none typebox rounded-lg absolute top-0 left-0 bg-transparent text-transparent resize-none"
          ref={inputRef}
          autoCorrect="false"
          autoCapitalize="none"
          autoComplete="off"
          onSelect={preventCursorPosition}
          onMouseDown={preventCursorPosition}
          onMouseUp={preventCursorPosition}
          onClick={preventCursorPosition}
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
          text={text}
        />
      </div>
      {/* {showFixAll && (
        <div
          className="absolute -top-4 text-error text-lg w-full text-center"
          style={{ lineHeight: 0 }}
        >
          You must fix all errors
        </div>
      )} */}
    </div>
  );
};
