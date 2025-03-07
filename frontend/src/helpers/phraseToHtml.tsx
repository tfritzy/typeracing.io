import { getCheckpointsForText } from "./getCheckpoints";
import { LegacyRef } from "react";

export function codePhraseToHtml(
  phrase: string,
  input: string,
  colorMap: string[],
  cursorRef: LegacyRef<HTMLSpanElement>
): [JSX.Element, number] {
  const [checkpoint, nextCheckpoint] = getCheckpointsForText(input, phrase);

  const html: JSX.Element[] = [];

  for (let i = 0; i <= checkpoint; i++) {
    html.push(
      <span style={{ color: colorMap[i], opacity: 0.15 }}>
        {character(phrase[i])}
      </span>
    );
  }

  let extraCount = 0;
  for (let i = checkpoint + 1; i < input.length; i++) {
    if (i < nextCheckpoint) {
      const isError = input[i] !== phrase[i];
      const errorStyle = isError
        ? {
            color: "var(--error)",
            textDecoration: "wavy underline",
            textDecorationColor: "var(--error)",
            textDecorationStyle: "wavy" as const,
            textUnderlineOffset: "5px",
          }
        : { color: colorMap[i] };

      html.push(
        <span className="" style={errorStyle}>
          {character(phrase[i])}
        </span>
      );
    } else {
      extraCount += 1;
      html.push(
        <span style={{ color: "var(--error)", opacity: 0.5 }}>
          {character(input[i])}
        </span>
      );
    }
  }

  html.push(<span ref={cursorRef} />);

  for (let i = input.length; i < nextCheckpoint; i++) {
    html.push(
      <span style={{ color: colorMap[i], opacity: 0.6 }}>
        {character(phrase[i])}
      </span>
    );
  }

  for (let i = nextCheckpoint; i < phrase.length; i++) {
    html.push(
      <span style={{ color: colorMap[i], opacity: 0.6 }}>
        {character(phrase[i])}
      </span>
    );
  }

  return [
    <div className="mono px-4 py-2 text-xl tracking-wider">{html}</div>,
    extraCount,
  ];
}

function character(char: string) {
  if (char === "\n") {
    return (
      <>
        <span className="opacity-50">↵</span>
        <br />
      </>
    );
  } else {
    return char;
  }
}

export function textPhraseToHtml(
  phrase: string,
  input: string,
  cursorRef: LegacyRef<HTMLSpanElement>
): [JSX.Element, number] {
  const [checkpoint, nextCheckpoint] = getCheckpointsForText(input, phrase);

  const text = [];
  for (let i = 0; i < checkpoint; i++) {
    text.push(
      <span className="text-base-700" key={"fin-" + i}>
        {phrase[i]}
      </span>
    );
    if (phrase[i] === "↵") text.push(<br key={`rest-br-${i}`} />);
  }

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
        <span className="text-base-400" key={`prog-${i}`}>
          {input[i]}
        </span>
      );
      if (input[i] === "↵") text.push(<br key={`prog-br-${i}`} />);
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
    <span className="text-base-600" key="restCheck">
      {phrase.slice(input.length, nextCheckpoint)}
    </span>
  );

  for (let i = nextCheckpoint; i < phrase.length; i++) {
    text.push(
      <span className="text-base-600" key={"rest-" + i}>
        {phrase[i]}
      </span>
    );
    if (phrase[i] === "↵") text.push(<br key={`rest-br-${i}`} />);
  }

  return [
    <div className="px-4 py-2 text-3xl [letter-spacing:.075em] [word-spacing:.125em]">
      {text}
    </div>,
    extraCount,
  ];
}
