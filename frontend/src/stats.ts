import { Timestamp } from "firebase/firestore";

export type KeyStroke = {
  character: string;
  time: Timestamp;
};

export type ErrorsAtTime = {
  time: number;
  errorCount: number;
};

export function getRawWpmBySecond(keystrokes: KeyStroke[]): number[] {
  if (keystrokes.length === 0) {
    return [];
  }

  const wpmBySecond: number[] = [];
  const charCountBySecond: number[] = [];

  for (const keystroke of keystrokes) {
    const second = keystroke.time.seconds;

    if (second < 0) {
      throw new Error(`Can't be sending negative keystrokes. Got: ${second}`);
    }

    while (charCountBySecond.length <= second) {
      charCountBySecond.push(0);
    }
    while (wpmBySecond.length <= second) {
      wpmBySecond.push(0);
    }

    charCountBySecond[second]++;
  }

  for (let i = 0; i < wpmBySecond.length; i++) {
    if (charCountBySecond[i] === 0) {
      wpmBySecond[i] = 0;
      continue;
    }

    wpmBySecond[i] = getWpm(charCountBySecond[i], 1);
  }

  for (let i = 2; i < wpmBySecond.length; i++) {
    wpmBySecond[i] =
      (wpmBySecond[i - 2] + wpmBySecond[i - 1] + wpmBySecond[i]) / 3;
  }

  return wpmBySecond;
}

export function getAggWpmBySecond(keyStrokes: KeyStroke[]): number[] {
  if (keyStrokes.length === 0) {
    return [];
  }

  const progressionStack: number[] = [];
  for (const stroke of keyStrokes) {
    if (stroke.character === "\b") {
      progressionStack.pop();
    } else {
      progressionStack.push(stroke.time.seconds);
    }
  }

  const aggWpmByCharacter: number[] = [];
  for (let i = 0; i < progressionStack.length; i++) {
    aggWpmByCharacter.push(getWpm(i + 1, progressionStack[i]));
  }

  let target = 1;
  const nearestIndexPriorWpmToSecondBounds: number[] = [];
  for (let i = 0; i < aggWpmByCharacter.length; i++) {
    while (progressionStack[i] > target) {
      target += 1;
      nearestIndexPriorWpmToSecondBounds.push(Math.max(i - 1, 0));
    }
  }

  const wpmBySecond: number[] = [];
  for (let i = 0; i < nearestIndexPriorWpmToSecondBounds.length; i++) {
    const second = i + 1;
    const priorI = nearestIndexPriorWpmToSecondBounds[i];
    const prevVal = aggWpmByCharacter[priorI];
    const nextVal = aggWpmByCharacter[priorI + 1];
    const priorTime = progressionStack[priorI];
    const nextTime = progressionStack[priorI + 1];
    const timespan = nextTime - priorTime;
    const percentAlongTimespan = (second - priorTime) / timespan;
    let lerpedWpm = prevVal + (nextVal - prevVal) * percentAlongTimespan;
    lerpedWpm = Math.max(lerpedWpm, 0);
    wpmBySecond.push(lerpedWpm);
  }

  const finalWpm = aggWpmByCharacter[aggWpmByCharacter.length - 1];
  wpmBySecond.push(finalWpm);

  return wpmBySecond;
}

export function getErrorCountByTime(
  keyStrokes: KeyStroke[],
  phrase: string
): ErrorsAtTime[] {
  if (keyStrokes.length === 0) {
    return [];
  }

  const errorCountByTime: ErrorsAtTime[] = [{ time: 0, errorCount: 0 }];
  const typedStack: string[] = [];
  let errorCount = 0;

  for (const stroke of keyStrokes) {
    if (stroke.character === "\b") {
      if (typedStack.length > 0) {
        if (
          typedStack.length > phrase.length ||
          typedStack[typedStack.length - 1] !== phrase[typedStack.length - 1]
        ) {
          errorCount--;
          errorCountByTime.push({
            time: stroke.time.seconds,
            errorCount: errorCount,
          });
        }
        typedStack.pop();
      }
    } else {
      typedStack.push(stroke.character);
      if (
        typedStack.length > phrase.length ||
        typedStack[typedStack.length - 1] !== phrase[typedStack.length - 1]
      ) {
        errorCount++;
        errorCountByTime.push({
          time: stroke.time.seconds,
          errorCount: errorCount,
        });
      }
    }
  }

  return errorCountByTime;
}

export function calculateAccuracy(
  strokes: KeyStroke[],
  phrase: string
): number {
  const errors = getErrorCount(strokes, phrase);
  return 1 - errors / phrase.length;
}

export function getErrorCount(keyStrokes: KeyStroke[], phrase: string): number {
  const typedStack: string[] = [];
  let errorCount = 0;

  for (const stroke of keyStrokes) {
    if (stroke.character === "\b") {
      if (typedStack.length > 0) {
        typedStack.pop();
      }
    } else {
      typedStack.push(stroke.character);
      if (
        typedStack.length > phrase.length ||
        typedStack[typedStack.length - 1] !== phrase[typedStack.length - 1]
      ) {
        errorCount++;
      }
    }
  }

  return errorCount;
}

export function getWpm(input: KeyStroke[] | number, time_s?: number): number {
  if (Array.isArray(input)) {
    if (input.length === 0) {
      return 0;
    }
    const parsed = parseKeystrokes(input);
    return getWpm(parsed.length, input[input.length - 1].time.seconds);
  } else {
    const charCount = input;
    return ((charCount / time_s!) * 60) / 5;
  }
}

export function getTime(keystrokes: KeyStroke[]): number {
  return keystrokes[keystrokes.length - 1].time.seconds;
}

export function wpmToTime(wpm: number, charCount: number): number {
  return (charCount * 60) / (5 * wpm);
}

export function parseKeystrokes(keyStrokes: KeyStroke[]): string {
  const wordStack: string[] = [];
  for (const keyStroke of keyStrokes) {
    if (keyStroke.character === "\b") {
      if (wordStack.length > 0) {
        wordStack.pop();
      }
    } else {
      wordStack.push(keyStroke.character);
    }
  }

  return wordStack.join("");
}
