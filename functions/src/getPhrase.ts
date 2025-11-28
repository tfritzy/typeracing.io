import { copypastas } from "./copypastas.js";
import { dutch } from "./dutch.js";
import { english } from "./english.js";
import { french } from "./french.js";
import { german } from "./german.js";
import { hindi } from "./hindi.js";
import { italian } from "./italian.js";
import { polish } from "./polski.js";
import { purtuguese } from "./portuguese.js";
import { russian } from "./russian.js";
import { shakespeare } from "./shakespeare.js";
import { spanish } from "./spanish.js";
import { csharp } from "./csharp.js";
import { ModeType } from "@shared/types.js";
import { python } from "./python.js";
import { typescript } from "./typescript.js";
import { fetchRandomQuote, WikiQuoteContext } from "./wikiQuoteClient.js";

export const getRandomElements = (arr: any[], n: number) =>
  arr.sort(() => Math.random() - 0.5).slice(0, n);

export const getRandomElement = (arr: any[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export function getPhrase(mode: ModeType): string[] {
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
    case "shakespeare":
      return [getRandomElement(shakespeare)];
    case "csharp":
      return [getRandomElement(csharp)];
    case "python":
      return [getRandomElement(python)];
    case "typescript":
      return [getRandomElement(typescript)];
    case "wikiquote":
      // For sync call, return a fallback - use getPhraseAsync for wikiquote
      return [getRandomElement(shakespeare)];
    default:
      return getRandomElements(english.slice(0, 500), numWords);
  }
}

/**
 * Async version of getPhrase that supports fetching quotes from external APIs.
 * Use this when the mode is "wikiquote" to fetch quotes from Wikiquote API.
 *
 * @param mode - The game mode type
 * @param ctx - Optional context for API requests (supports SpacetimeDB API request functionality)
 * @returns A promise that resolves to an array of strings representing the phrase
 */
export async function getPhraseAsync(
  mode: ModeType,
  ctx?: WikiQuoteContext
): Promise<string[]> {
  if (mode === "wikiquote") {
    const quote = await fetchRandomQuote(ctx);
    return [quote];
  }

  // For all other modes, use the synchronous version
  return getPhrase(mode);
}
