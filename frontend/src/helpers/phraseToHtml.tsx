import { TokensResult } from "shiki";
import { getCheckpointsForText } from "./getCheckpoints";
import { LegacyRef } from "react";

export function codePhraseToHtml(
  phrase: string,
  input: string,
  tokens: TokensResult,
  cursorRef: LegacyRef<HTMLSpanElement>
) {
  const [checkpoint, nextCheckpoint] = getCheckpointsForText(input, phrase);

  const colorMap = buildColorMap(tokens);

  const html: JSX.Element[] = [];

  for (let i = 0; i <= checkpoint; i++) {
    html.push(
      <span style={{ color: colorMap[i], opacity: 0.25 }}>
        {character(phrase[i])}
      </span>
    );
  }

  for (let i = checkpoint + 1; i < input.length; i++) {
    if (i < nextCheckpoint) {
      const color = input[i] === phrase[i] ? colorMap[i] : "var(--error)";
      html.push(
        <span className="brightness-10" style={{ color: color }}>
          {character(phrase[i])}
        </span>
      );
    } else {
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
      <span style={{ color: colorMap[i], opacity: 0.9 }}>
        {character(phrase[i])}
      </span>
    );
  }

  for (let i = nextCheckpoint; i < phrase.length; i++) {
    html.push(
      <span style={{ color: colorMap[i], opacity: 0.9 }}>
        {character(phrase[i])}
      </span>
    );
  }

  return (
    <div className="font-mono px-4 py-3" style={{ backgroundColor: tokens.bg }}>
      {html}
    </div>
  );
}

function character(char: string) {
  if (char === "\n") {
    return "↵\n";
  } else {
    return char;
  }
}

function buildColorMap(tokens: TokensResult): string[] {
  const colorMap: string[] = [];

  tokens.tokens.forEach((line) => {
    line.forEach((token) => {
      for (let i = 0; i < token.content.length; i++) {
        colorMap.push(token.color || "");
      }
    });
    colorMap.push(tokens.fg || "");
  });

  return colorMap;
}

export function textPhraseToHtml(
  phrase: string,
  input: string,
  cursorRef: LegacyRef<HTMLSpanElement>
) {
  const [checkpoint, nextCheckpoint] = getCheckpointsForText(input, phrase);

  const text = [];
  for (let i = 0; i < checkpoint; i++) {
    text.push(
      <span className="opacity-25" key={"fin-" + i}>
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
        <span className="opacity-100" key={`prog-${i}`}>
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
    <span className="opacity-80" key="restCheck">
      {phrase.slice(input.length, nextCheckpoint)}
    </span>
  );

  for (let i = nextCheckpoint; i < phrase.length; i++) {
    text.push(
      <span className="opacity-80" key={"rest-" + i}>
        {phrase[i]}
      </span>
    );
    if (phrase[i] === "↵") text.push(<br key={`rest-br-${i}`} />);
  }

  return <div className="px-4 py-3">{text}</div>;
}
