import { ThemedToken } from "shiki";

export function getCheckpointsForText(input: string, phrase: string): number[] {
  let checkpoint = -1;
  let nextCheckpoint = phrase.length;
  let inFinishedRegion = true;
  for (let i = 0; i <= phrase.length; i++) {
    if (input[i] !== phrase[i]) {
      inFinishedRegion = false;
    }

    if (
      (phrase[i] === " " && phrase[i + 1] != " ") ||
      phrase[i] === "\n" ||
      i === phrase.length
    ) {
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
export function getCheckpointsForCode(
  tokens: ThemedToken[][],
  input: string,
  phrase: string
): number[] {
  let checkpoint = 0;
  let nextCheckpoint = phrase.length;
  let inFinishedRegion = true;
  let currentPosition = 0;

  // Handle empty or invalid inputs
  if (!tokens.length || !phrase) {
    return [0, phrase.length];
  }

  // Iterate through each line of tokens
  for (let line = 0; line < tokens.length; line++) {
    const lineTokens = tokens[line];

    // Iterate through each token in the line
    for (let i = 0; i < lineTokens.length; i++) {
      const token = lineTokens[i];
      const tokenLength = token.content.length;
      const tokenEnd = currentPosition + tokenLength;

      // Check if we've gone beyond the phrase length
      if (currentPosition >= phrase.length) {
        break;
      }

      // Check if the current token matches the input
      const inputSegment = input.slice(currentPosition, tokenEnd);
      const phraseSegment = phrase.slice(currentPosition, tokenEnd);

      if (inputSegment !== phraseSegment) {
        inFinishedRegion = false;
      }

      // If we're at a token boundary
      if (tokenEnd <= phrase.length) {
        if (inFinishedRegion) {
          checkpoint = tokenEnd;
        } else if (nextCheckpoint === phrase.length) {
          nextCheckpoint = tokenEnd;
          break;
        }
      }

      currentPosition = tokenEnd;
    }

    // If we've found nextCheckpoint, no need to continue
    if (nextCheckpoint !== phrase.length) {
      break;
    }
  }

  // If we haven't found a next checkpoint, look for the next token boundary
  if (nextCheckpoint === phrase.length && !inFinishedRegion) {
    currentPosition = 0;
    for (let line = 0; line < tokens.length; line++) {
      const lineTokens = tokens[line];
      for (let i = 0; i < lineTokens.length; i++) {
        const token = lineTokens[i];
        const tokenEnd = currentPosition + token.content.length;
        if (tokenEnd > checkpoint) {
          nextCheckpoint = Math.min(tokenEnd, phrase.length);
          break;
        }
        currentPosition += token.content.length;
      }
      if (nextCheckpoint !== phrase.length) {
        break;
      }
    }
  }

  return [checkpoint, nextCheckpoint];
}
