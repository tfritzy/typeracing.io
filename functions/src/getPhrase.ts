import { copypastas } from "./copypastas.js";
import { english } from "./english.js";
import { french } from "./french.js";

export const getRandomElements = (arr: any[], n: number) =>
  arr.sort(() => Math.random() - 0.5).slice(0, n);

export const getRandomElement = (arr: any[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export function getPhrase(mode: string): string[] {
  const numWords = 15 + Math.floor(Math.random() * 10);

  switch (mode) {
    case "english":
      return getRandomElements(english.slice(0, 500), numWords);
    case "français":
      return getRandomElements(french.slice(0, 500), numWords);
    case "copypastas":
      return [getRandomElement(copypastas)];
    default:
      return getRandomElements(english.slice(0, 500), numWords);
  }
}
