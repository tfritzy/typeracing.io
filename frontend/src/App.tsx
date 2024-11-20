import React from "react";
import { generateRandomName } from "./generateRandomName";
import {
  setRaceResults,
  updatePlayerId,
  updatePlayerName,
  updateToken,
} from "./store/playerSlice";
import { MainMenu } from "./MainMenu";
import { Route, Routes, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Game } from "./Game";
import { useAppDispatch } from "./store/storeHooks";
import { Footer } from "./Footer";
import { RoadMap } from "./Roadmap";

function App() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.remove();
    }
  }, []);

  React.useEffect(() => {
    let name = Cookies.get("name");
    if (!name) {
      name = generateRandomName();
      Cookies.set("name", name, {
        sameSite: "strict",
        expires: 3650,
      });
    }

    let playerId = Cookies.get("playerId");
    if (!playerId) {
      playerId = "plyr_" + Math.random().toString(36).substring(7);
      Cookies.set("playerId", playerId, {
        sameSite: "strict",
        expires: 3650,
      });
    }

    let token = Cookies.get("token");
    if (!token) {
      token = "tkn_" + Math.random().toString(36).substring(7);
      Cookies.set("token", token, {
        sameSite: "strict",
        expires: 3650,
      });
    }

    let raceResults = localStorage.getItem("raceResults");
    if (raceResults) {
      dispatch(setRaceResults(JSON.parse(raceResults)));
    }

    dispatch(updatePlayerName(name));
    dispatch(updatePlayerId(playerId));
    dispatch(updateToken(token));
  }, [dispatch]);

  // Global hotkeys
  React.useEffect(() => {
    const handleHotkeys = (event: KeyboardEvent) => {
      if (event.key === "t") {
        const element = document.getElementById("type-box");
        if (
          document.activeElement !== element &&
          document.activeElement?.tagName !== "INPUT"
        ) {
          element?.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/in-game" element={<Game />} />
        <Route path="/roadmap" element={<RoadMap />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
