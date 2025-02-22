import { Race } from "./Race";
import { Firestore, Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { Analytics } from "firebase/analytics";
import { MainMenu } from "./MainMenu";

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

export function FrenchPage() {
  return <MainMenu modeType="français" />;
}

export function SpanishPage() {
  return <MainMenu modeType="español" />;
}

export function GermanPage() {
  return <MainMenu modeType="deutsch" />;
}

export function ItalianPage() {
  return <MainMenu modeType="italiano" />;
}

export function PortuguesePage() {
  return <MainMenu modeType="português" />;
}

export function DutchPage() {
  return <MainMenu modeType="dutch" />;
}

export function PolishPage() {
  return <MainMenu modeType="polski" />;
}

export function RussianPage() {
  return <MainMenu modeType="русский" />;
}

export function HindiPage() {
  return <MainMenu modeType="हिंदी" />;
}

export function CopypastaPage() {
  return <MainMenu modeType="copypastas" />;
}

export function CSharpPage() {
  return <MainMenu modeType="csharp" />;
}

export function ShakespearePage() {
  return <MainMenu modeType="shakespeare" />;
}
