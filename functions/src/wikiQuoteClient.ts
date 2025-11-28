/**
 * Wiki Quote Client
 *
 * This client fetches random quotes from Wikiquote via Wikipedia's API.
 * It accepts a context (ctx) parameter to support SpacetimeDB's API request functionality.
 */

export interface WikiQuoteContext {
  /**
   * Optional AbortSignal to cancel the request
   */
  signal?: AbortSignal;

  /**
   * Optional timeout in milliseconds (default: 5000)
   */
  timeout?: number;
}

interface WikiQuoteResult {
  quote: string;
  source?: string;
}

/**
 * List of famous people whose quotes we can fetch from Wikiquote
 */
const QUOTE_SOURCES = [
  "Albert_Einstein",
  "Mark_Twain",
  "Oscar_Wilde",
  "Winston_Churchill",
  "Benjamin_Franklin",
  "Abraham_Lincoln",
  "Mahatma_Gandhi",
  "Martin_Luther_King_Jr.",
  "Nelson_Mandela",
  "Theodore_Roosevelt",
  "Thomas_Jefferson",
  "George_Washington",
  "John_F._Kennedy",
  "Franklin_D._Roosevelt",
  "Eleanor_Roosevelt",
];

/**
 * Fallback quotes in case the API request fails
 */
const FALLBACK_QUOTES = [
  "The only thing we have to fear is fear itself.",
  "In the middle of difficulty lies opportunity.",
  "Be the change you wish to see in the world.",
  "The journey of a thousand miles begins with a single step.",
  "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
  "The only way to do great work is to love what you do.",
  "Life is what happens when you're busy making other plans.",
  "In three words I can sum up everything I've learned about life: it goes on.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "The way to get started is to quit talking and begin doing.",
];

/**
 * Fetches a random quote from Wikiquote
 *
 * @param ctx - The context object containing optional signal and timeout
 * @returns A promise that resolves to a quote string
 */
export async function fetchRandomQuote(ctx?: WikiQuoteContext): Promise<string> {
  const timeout = ctx?.timeout ?? 5000;
  const controller = new AbortController();
  const signal = ctx?.signal ?? controller.signal;

  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Select a random quote source
    const source = QUOTE_SOURCES[Math.floor(Math.random() * QUOTE_SOURCES.length)];

    // Fetch from Wikipedia's API (Wikiquote shares the same API structure)
    const url = `https://en.wikiquote.org/api.php?action=query&titles=${source}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`;

    const response = await fetch(url, {
      signal,
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract the quote from the response
    const quote = extractQuoteFromResponse(data);

    if (quote) {
      return cleanQuote(quote);
    }

    // If extraction failed, return a fallback quote
    return getRandomFallbackQuote();
  } catch (error) {
    // On any error (timeout, network, parsing), return a fallback quote
    console.error("Failed to fetch quote from Wikiquote:", error);
    return getRandomFallbackQuote();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extracts a quote from the Wikiquote API response
 */
function extractQuoteFromResponse(data: any): string | null {
  try {
    const pages = data?.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (!pageId || pageId === "-1") return null;

    const extract = pages[pageId]?.extract;
    if (!extract || typeof extract !== "string") return null;

    // The extract often contains multiple quotes or paragraphs
    // Split by newlines and get meaningful content
    const lines = extract
      .split(/\n+/)
      .filter((line: string) => line.trim().length > 20 && line.trim().length < 500);

    if (lines.length === 0) return null;

    // Return a random line from the extract
    return lines[Math.floor(Math.random() * lines.length)];
  } catch {
    return null;
  }
}

/**
 * Cleans up a quote by removing extra whitespace and unwanted characters
 */
function cleanQuote(quote: string): string {
  return quote
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[""]/g, '"') // Normalize quotes
    .replace(/['']/g, "'") // Normalize apostrophes
    .replace(/—/g, "-") // Normalize dashes
    .trim();
}

/**
 * Returns a random fallback quote
 */
function getRandomFallbackQuote(): string {
  return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
}

/**
 * Gets a quote suitable for use as a typing phrase
 *
 * @param ctx - The context object containing optional signal and timeout
 * @returns A promise that resolves to a WikiQuoteResult
 */
export async function getWikiQuote(ctx?: WikiQuoteContext): Promise<WikiQuoteResult> {
  const quote = await fetchRandomQuote(ctx);
  return {
    quote,
    source: "Wikiquote",
  };
}
