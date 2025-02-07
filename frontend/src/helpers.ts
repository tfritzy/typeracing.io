import { NavigateFunction } from "react-router-dom";
import { User } from "firebase/auth";
import Cookies from "js-cookie";
import { Analytics, logEvent } from "firebase/analytics";

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
  navigate("/race/" + data.id);
}

function getReportResultUrl() {
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:5001/typeracing-io/us-central1/recordGameResult";
  } else {
    return "Idk";
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
