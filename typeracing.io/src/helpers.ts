import { NavigateFunction } from "react-router-dom";
import { FIND_GAME } from "./constants";
import { User } from "firebase/auth";
import Cookies from "js-cookie";

export async function findGame(user: User, navigate: NavigateFunction) {
  const token = await user.getIdToken();

  const name = Cookies.get("name");
  const response = await fetch(FIND_GAME, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      displayName: name,
    }),
  });

  console.log("Made request");

  const data = await response.json();
  navigate("/race/" + data.id);
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
