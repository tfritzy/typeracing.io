import { copypastas } from "./copypastas.js";
import { dutch } from "./dutch.js";
import { english } from "./english.js";
import { french } from "./french.js";
import { german } from "./german.js";
import { hindi } from "./hindi.js";
import { italian } from "./italian.js";
import { polish } from "./polski.js";
import { purtuguese } from "./portuguese.js";
import { reddit } from "./reddit.js";
import { russian } from "./russian.js";
import { shakespeare } from "./shakespeare.js";
import { spanish } from "./spanish.js";

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
    case "español":
      return getRandomElements(spanish.slice(0, 500), numWords);
    case "deutsch":
      return getRandomElements(german.slice(0, 500), numWords);
    case "italiano":
      return getRandomElements(italian.slice(0, 500), numWords);
    case "português":
      return getRandomElements(purtuguese.slice(0, 500), numWords);
    case "dutch":
      return getRandomElements(dutch.slice(0, 500), numWords);
    case "polski":
      return getRandomElements(polish.slice(0, 500), numWords);
    case "русский":
      return getRandomElements(russian.slice(0, 500), numWords);
    case "हिंदी":
      return getRandomElements(hindi.slice(0, 500), numWords);
    case "copypastas":
      return [getRandomElement(copypastas)];
    case "reddit":
      return [getRandomElement(reddit)];
    case "shakespeare":
      return [getRandomElement(shakespeare)];
    default:
      return getRandomElements(english.slice(0, 500), numWords);
  }
}
