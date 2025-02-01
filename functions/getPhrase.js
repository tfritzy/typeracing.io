import { english } from "./english.js";
import { french } from "./french.js";

export const getRandomElements = (arr, n) =>
  arr.sort(() => Math.random() - 0.5).slice(0, n);

export function getPhrase(mode) {
  const numWords = 15 + Math.floor(Math.random() * 10);

  switch (mode) {
    case "english":
      return getRandomElements(english.slice(0, 500), numWords);
    case "français":
      return getRandomElements(french.slice(0, 500), numWords);
    default:
      return getRandomElements(english.slice(0, 500), numWords);
  }
}
