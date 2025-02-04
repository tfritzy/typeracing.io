import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { KeyStroke } from "./stats";
import { Timestamp } from "firebase/firestore";

function lerp(start: number, end: number, alpha: number) {
  return start + (end - start) * alpha;
}

const cursorYOffset = 6;
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
  const [cursorPos, setCursorPos] = useState({
    current: { x: cursorStartPos, y: cursorStartPos },
    target: { x: cursorStartPos, y: cursorStartPos },
  });

  const updateCursorPositions = useCallback(
    (immediate = false) => {
      if (props.targetObject.current) {
        const cursorRect = props.targetObject.current.getBoundingClientRect();
        const newPos = {
          x: cursorRect.left + cursorXOffset,
          y: cursorRect.top + cursorYOffset,
        };

        setCursorPos((prev) => ({
          current: immediate ? newPos : prev.current,
          target: newPos,
        }));
      }
    },
    [props.targetObject]
  );

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      if (
        Math.abs(cursorPos.target.y - cursorPos.current.y) < 0.05 &&
        Math.abs(cursorPos.target.x - cursorPos.current.x) < 0.05
      ) {
        return;
      }

      setCursorPos((prev) => ({
        current: {
          x: lerp(prev.current.x, prev.target.x, 0.4),
          y: lerp(prev.current.y, prev.target.y, 0.4),
        },
        target: prev.target,
      }));

      updateCursorPositions();
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [cursorPos, updateCursorPositions]);

  useEffect(() => {
    const handleResize = () => updateCursorPositions(true);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCursorPositions]);

  useEffect(() => {
    updateCursorPositions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentWord, props.targetObject.current, updateCursorPositions]);

  useEffect(() => {
    updateCursorPositions(true);
  }, [props.phrase, updateCursorPositions]);

  const cursor = useMemo(
    () => (
      <span
        className={`h-8 w-0.5 bg-base-400 fixed rounded-full ${
          props.pulsing ? "cursor" : ""
        }`}
        style={{
          top: cursorPos.current.y,
          left: cursorPos.current.x,
        }}
        hidden={props.disabled}
      />
    ),
    [cursorPos, props.disabled, props.pulsing]
  );

  return cursor;
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

export const TypeBox = ({
  phrase,
  lockedCharacterIndex,
  onWordComplete,
  isLocked,
  onFirstKeystroke,
}: TypeBoxProps) => {
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

  const { text, hasError } = React.useMemo(() => {
    const text = [
      <span className="text-base-600" key="completed">
        {phrase.slice(0, lockedCharacterIndex)}
      </span>,
    ];

    let hasError = false;
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] !== phrase[lockedCharacterIndex + i]) {
        hasError = true;
        text.push(
          <span
            className="relative decoration-error"
            key={lockedCharacterIndex + i}
          >
            <span
              className="text-error"
              style={{
                backgroundColor:
                  phrase[lockedCharacterIndex + i] === " "
                    ? "var(--error)"
                    : "",
                opacity: phrase[lockedCharacterIndex + i] === " " ? 0.2 : "",
              }}
            >
              {phrase[lockedCharacterIndex + i]}
            </span>
          </span>
        );
      } else {
        text.push(
          <span key={lockedCharacterIndex + i} className=" text-base-200">
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
      <span key="word-remainder" className="text-base-400">
        {remainderOfWord}
      </span>
    );

    if (nextSpaceIndex !== -1) {
      const remainingText = phrase.slice(nextSpaceIndex);
      text.push(
        <span key="remaining" className="text-base-400">
          {remainingText}
        </span>
      );
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
        onFirstKeystroke?.();
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
      isLocked,
      currentWord.length,
      lockedCharacterIndex,
      hasError,
      phrase.length,
      onFirstKeystroke,
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
        time: Timestamp.now(),
      });
      keyStrokes.current.compositeSize--;
    }

    while (keyStrokes.current.compositeSize < currentWord.length) {
      keyStrokes.current.strokes.push({
        character: currentWord[keyStrokes.current.compositeSize],
        time: Timestamp.now(),
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
      React.startTransition(() => {
        onWordComplete(
          newEndIndex,
          keyStrokes.current.strokes,
          wordErrorsCount.current
        );
        setCurrentWord("");
        wordErrorsCount.current = 0;
        keyStrokes.current.strokes = [];
        keyStrokes.current.compositeSize = 0;
      });
    }
  }, [currentWord, lockedCharacterIndex, onWordComplete, phrase]);

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
        className="absolute border border-error rounded-lg z-[-1] transition-opacity"
      />
    );
  }, [hasError]);

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
          className="absolute -top-4 text-error text-lg w-full text-center"
          style={{ lineHeight: 0 }}
        >
          You must fix all errors
        </div>
      )}
    </div>
  );
};
