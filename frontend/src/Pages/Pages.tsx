import { Race } from "./Race";
import { Firestore, Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { Analytics } from "firebase/analytics";
import { MainMenu } from "./MainMenu";
import { Navigate, useParams } from "react-router-dom";
import { validModes } from "../modes";
import { ModeType } from "@shared/types";

export function HomePage() {
  return (
    <>
      <MainMenu modeType="english" />
    </>
  );
}

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

export function MainMenuWrapper() {
  const { mode } = useParams();

  if (!validModes.has(mode || "")) {
    return <Navigate to="/" replace />;
  }

  return <MainMenu key={mode} modeType={mode as ModeType} />;
}
