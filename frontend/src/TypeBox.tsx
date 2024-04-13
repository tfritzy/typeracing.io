import React, { useEffect, useLayoutEffect, useState } from "react";

function lerp(start: number, end: number, alpha: number) {
  return start + (end - start) * alpha;
}

type TypeBoxProps = {
  words: string[];
  wordIndex: number;
  onWordComplete: (word: string) => void;
};

export const TypeBox = (props: TypeBoxProps) => {
  const [currentWord, setCurrentWord] = useState("");
  const [inputWidth, setInputWidth] = useState(0);
  const phraseRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLSpanElement>(null);
  const [cursorXPos, setCursorXPos] = useState(0);
  const [cursorYPos, setCursorYPos] = useState(0);
  const [targetCursorXPos, setTargetCursorXPos] = useState(0);
  const [targetCursorYPos, setTargetCursorYPos] = useState(0);
  const [cursorPulsing, setCursorPinging] = useState(true);
  const setPingingRef = React.useRef<NodeJS.Timeout | null>();

  useEffect(() => {
    if (phraseRef.current) {
      setInputWidth(phraseRef.current.clientWidth);
    }
  }, [props.words, props.wordIndex, phraseRef.current?.clientWidth]);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (props.wordIndex >= props.words.length) {
      return;
    }

    setCursorPinging(false);
    if (setPingingRef.current) {
      clearTimeout(setPingingRef.current);
    }
    setPingingRef.current = setTimeout(() => {
      setCursorPinging(true);
    }, 1000);

    if (
      event.target.value === props.words[props.wordIndex] + " " ||
      (props.wordIndex === props.words.length - 1 &&
        event.target.value === props.words[props.wordIndex])
    ) {
      props.onWordComplete(event.target.value);
      setCurrentWord("");
    } else {
      setCurrentWord(event.target.value);
    }
  };

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
      setTargetCursorYPos(cursorRect.top);
    }
  }, [currentWord]);

  let text = [
    <span className="text-white">
      {props.words.slice(0, props.wordIndex).join(" ") + " "}
    </span>,
  ];

  for (let i = 0; i < currentWord.length; i++) {
    if (currentWord[i] !== props.words[props.wordIndex][i]) {
      text.push(
        <span className="text-rose-500 underline">
          {props.words[props.wordIndex][i] || currentWord[i]}
        </span>
      );
    } else {
      text.push(<span className="text-gray-100">{currentWord[i]}</span>);
    }
  }

  text.push(<span ref={cursorRef} key="cursor" />);

  let remainingText = props.words.slice(props.wordIndex).join(" ");
  text.push(
    <span className="text-gray-500">
      {remainingText.slice(currentWord.length)}
    </span>
  );

  return (
    <div className="relative ap">
      <div className="text-xl max-w-3xl vscode-font p-2 shadow-black">
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
          className={`bg-amber-400 h-[24px] w-[3px] fixed rounded ${
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
