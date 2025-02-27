import { NavigateFunction } from "react-router-dom";
import { User } from "firebase/auth";
import Cookies from "js-cookie";
import { Analytics, logEvent } from "firebase/analytics";
import { GameResult, ModeType } from "@shared/types";

export function getFillGameUrl() {
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:5001/typeracing-io/us-central1/fillGameWithBots";
  } else {
    return "https://fillgamewithbots-ifdmb3m76a-uc.a.run.app";
  }
}

function getFindGameUrl() {
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:5001/typeracing-io/us-central1/findGame";
  } else {
    return "https://findgame-ifdmb3m76a-uc.a.run.app";
  }
}

export async function findGame(
  user: User,
  navigate: NavigateFunction,
  analytics: Analytics,
  mode: string
) {
  const token = await user.getIdToken();

  logEvent(analytics, "find_race");
  const name = Cookies.get("name");
  const response = await fetch(getFindGameUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      displayName: name,
      mode: mode,
    }),
  });

  const data = await response.json();
  navigate(`/${mode}/${data.id}`);
}

function getReportResultUrl() {
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:5001/typeracing-io/us-central1/recordGameResult";
  } else {
    return "https://recordgameresult-ifdmb3m76a-uc.a.run.app ";
  }
}

export async function reportResult(user: User, gameId: string) {
  const token = await user.getIdToken();
  await fetch(getReportResultUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      gameId: gameId,
    }),
  });
}

export function placeToString(place: number) {
  switch (place) {
    case 0:
      return "1st";
    case 1:
      return "2nd";
    case 2:
      return "3rd";
    case 3:
      return "4th";
    default:
      return "";
  }
}

export function generateYearOfGameData(
  startDate: Date = new Date(2024, 0, 1)
): Map<string, GameResult[]> {
  const gameData = new Map<string, GameResult[]>();
  const games = ["typeracer", "monkeytype", "10fastfingers", "ztype"];
  const modes: ModeType[] = ["english", "copypastas", "shakespeare"];

  // Generate between 0-5 games for each day of the year
  for (let day = 0; day < 365; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + day);
    const isoDate = currentDate.toISOString().split("T")[0];

    const numGames = Math.floor(Math.random() * 6); // 0-5 games per day
    const dailyGames: GameResult[] = [];

    for (let i = 0; i < numGames; i++) {
      const gameResult: GameResult = {
        game: games[Math.floor(Math.random() * games.length)],
        mode: modes[Math.floor(Math.random() * modes.length)],
        // Generate WPM between 30-120
        wpm: Math.floor(Math.random() * (120 - 30) + 30),
        // Generate place between 1-20
        place: Math.floor(Math.random() * 20) + 1,
        // Generate length between 25-500 depending on mode
        length: Math.floor(Math.random() * (500 - 25) + 25),
      };

      gameResult.length = Math.floor(Math.random() * (100 - 10) + 10); // 10-100 words

      dailyGames.push(gameResult);
    }

    if (dailyGames.length > 0) {
      gameData.set(isoDate, dailyGames);
    }
  }

  return gameData;
}

declare global {
  interface Date {
    getDayOfYear(): number;
  }
}

Date.prototype.getDayOfYear = function () {
  const start = new Date(this.getFullYear(), 0, 0);
  const diff = (this as Date).getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};
