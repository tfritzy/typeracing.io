import { words } from "./words.js";

export const getRandomElements = (arr, n) =>
  arr.sort(() => Math.random() - 0.5).slice(0, n);

export function getPhrase(mode) {
  switch (mode) {
    case "200":
      return getRandomElements(words.slice(0, 200), 30);
    case "500":
      return getRandomElements(words.slice(0, 500), 30);
    case "1000":
      return getRandomElements(words.slice(0, 1000), 30);
    default:
      return getRandomElements(words.slice(0, 200), 30);
  }
}
