import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyStroke } from "../stats";
import { Cursor } from "./Cursor";
import { ProgrammingLanguage, Timestamp } from "@shared/types";
import { Timestamp as FSTimestamp } from "firebase/firestore";
import { getCheckpointsForText } from "../helpers/getCheckpoints";
import { codeToTokens } from "shiki";
import { codePhraseToHtml, textPhraseToHtml } from "../helpers/phraseToHtml";

type TypeBoxProps = {
  phrase: string;
  onWordComplete?: (charIndex: number, keystrokes: KeyStroke[]) => void;
  onPhraseComplete?: (keystrokes: KeyStroke[], errorCount: number) => void;
  isLocked: boolean;
  onFirstKeystroke?: () => void;
  getNow: () => Timestamp;
  startTime: Timestamp;
  programmingLanguage: ProgrammingLanguage | undefined;
};

export const TypeBox = ({
  phrase,
  onWordComplete,
  onPhraseComplete,
  isLocked,
  onFirstKeystroke,
  getNow,
  startTime,
  programmingLanguage,
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
  const [codeColorMap, setCodeColorMap] = useState<string[] | undefined>(
    undefined
  );

  useEffect(() => {
    if (phraseRef.current) {
      setInputWidth(phraseRef.current.clientWidth);
    }
  }, [phrase, phraseRef.current?.clientWidth]);

  const preventCursorPosition = useCallback(() => {
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
    if (programmingLanguage) {
      codeToTokens(phrase, {
        lang: programmingLanguage,
        theme: "github-dark-dimmed",
      }).then((tokens) => {
        const colorMap: string[] = [];

        tokens.tokens.forEach((line) => {
          line.forEach((token) => {
            for (let i = 0; i < token.content.length; i++) {
              colorMap.push(token.color || "");
            }
          });
          colorMap.push(tokens.fg || "");
        });

        setCodeColorMap(colorMap);
      });
    } else {
      setCodeColorMap(undefined);
    }
  }, [programmingLanguage, phrase]);

  const [text, extraCount] = useMemo(() => {
    if (programmingLanguage && !codeColorMap) return [null, 0];

    return programmingLanguage
      ? codePhraseToHtml(phrase, input, codeColorMap!, cursorRef)
      : textPhraseToHtml(phrase, input, cursorRef);
  }, [input, programmingLanguage, phrase, codeColorMap]);

  const handleInput = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (isLocked) {
        return;
      }

      if (input.length === 0) {
        onFirstKeystroke?.();
      }

      // Get the input value
      let currentValue = event.target.value;

      // Auto-complete spaces from the target phrase
      if (
        currentValue.length > 0 &&
        // currentValue.length < phrase.length &&
        currentValue.length > input.length
      ) {
        // Check if we're at a position after a newline
        const lastChar = currentValue.charAt(currentValue.length - 1);
        if (lastChar === "\n") {
          // We're at the start of a new line, check for leading spaces in the target phrase
          const nextIndex = currentValue.length;
          let spacesToAdd = "";

          // Count consecutive spaces in the target phrase at current position
          for (let i = nextIndex; i < phrase.length; i++) {
            if (phrase[i] === " ") {
              spacesToAdd += " ";
            } else {
              break;
            }
          }

          console.log("Spaces to add", spacesToAdd.length);

          // Add those spaces to the current value if there are any
          if (spacesToAdd.length > 0) {
            currentValue += spacesToAdd;
            event.target.value = currentValue;
            console.log(event.target.value);
          }
        }
      }

      const [iCheckpoint, iNextCheckpoint] = getCheckpointsForText(
        input,
        phrase
      );
      console.log(iCheckpoint, iNextCheckpoint);

      const [eCheckpoint, eNextCheckpoint] = getCheckpointsForText(
        event.target.value,
        phrase
      );
      const maxCheckpoint = Math.max(iCheckpoint, eCheckpoint);

      if (iCheckpoint >= phrase.length) {
        return;
      }

      if (event.target.value.length > eNextCheckpoint + 10) {
        console.log("too far", event.target.value.length, eNextCheckpoint + 10);
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
      <div className="type-box">
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
          phrase={phrase}
        />
      </div>
      {extraCount > 5 && (
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
