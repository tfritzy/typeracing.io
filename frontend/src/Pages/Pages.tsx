import { Race } from "./Race";
import { Firestore, Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { Analytics } from "firebase/analytics";
import { MainMenu } from "./MainMenu";
import { Navigate, useParams } from "react-router-dom";
import { ModeType } from "@shared/types";
import {
  languageModes,
  programmingModes,
  validLanguageModes,
  validProgrammingModes,
} from "../modes";

export function RacePage({
  db,
  user,
  analytics,
  getNow,
}: {
  db: Firestore;
  user: User | null;
  analytics: Analytics;
  getNow: () => Timestamp;
}) {
  return <Race db={db} user={user} analytics={analytics} getNow={getNow} />;
}

export function ProgrammingMainMenuWrapper() {
  const { mode } = useParams();

  if (mode && !validProgrammingModes.has(mode || "")) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainMenu
      selectableModes={programmingModes}
      key={mode}
      modeType={mode as ModeType}
      defaultMode="python"
      subRoute="code"
    />
  );
}

export function MainMenuWrapper() {
  const { mode } = useParams();

  if (mode && !validLanguageModes.has(mode || "")) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainMenu
      selectableModes={languageModes}
      key={mode}
      modeType={mode as ModeType}
      defaultMode="english"
    />
  );
}
