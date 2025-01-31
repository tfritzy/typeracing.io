import React from "react";
import { generateRandomName } from "./helpers/generateRandomName";
import {
  setRaceResults,
  updatePlayerId,
  updatePlayerName,
  updateToken,
} from "./store/playerSlice";
import { MainMenu } from "./main-menu/MainMenu";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Game } from "./game/Game";
import { useAppDispatch } from "./store/storeHooks";
import { TimeTrials } from "./time-trials/TimeTrials";
import { Header } from "./components/Header";
import { TimeTrial } from "./time-trials/TimeTrial";
import { Footer } from "./components/Footer";
import { RoadMap } from "./roadmap/Roadmap";
import { PrivacyPolicy } from "./privacy-policy/PrivacyPolicy";

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
    <div className="h-screen flex flex-col">
      <Header />
      <div className="content w-full grow overflow-y-auto overflow-x-visible">
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/race" element={<MainMenu />} />
          <Route path="/in-game" element={<Game />} />
          <Route path="/time-trials" element={<TimeTrials />} />
          <Route path="/time-trials/:id" element={<TimeTrial />} />
          <Route path="/roadmap" element={<RoadMap />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to="/race" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
