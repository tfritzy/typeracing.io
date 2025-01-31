import { Helmet } from "react-helmet-async";
import { Race } from "./Race";
import { Firestore } from "firebase/firestore";
import { User } from "firebase/auth";
import { Analytics } from "firebase/analytics";
import { MainMenu } from "./MainMenu";
import { ModeListPage } from "./ModeListPage";

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Multiplayer typing races</title>
        <meta
          name="description"
          content="Test your typing skills against real live people from all over the world. Compete against your friends, track your wpm, and improve your skills."
        />
        <meta
          name="keywords"
          content="free typing games,typing,touch typing,wpm,typing software,typing game,typing practice,free typing program,typing skills"
        />
        <meta
          property="og:description"
          content="Live type racing competition"
        />
      </Helmet>
      <div className="hidden">
        <h1>typeracing.io - Compete in online typing races</h1>

        <h2>
          Improve your live chat typing speed while racing against real players
        </h2>
        <p>
          typeracing.io is an online typing platform that allows you to race
          against other players from around the world in real-time.
        </p>

        <p>
          Unlike traditional typing tests or tutorials, typeracing.io makes
          improving your typing skills an engaging and competitive experience.
        </p>

        <p>
          In each race, you compete against opponents of similar skill levels,
          you'll find yourself motivated to improve your typing speed and
          accuracy to climb the leaderboards.
        </p>

        <p>
          With its multiplayer focus and diverse range of typing prompts,
          typeracing.io offers a fresh and exciting approach to honing your
          typing abilities. Whether you're a beginner looking to build a solid
          foundation or an experienced typist seeking to push your limits,
          typeracing.io's competitive environment is designed to help you reach
          new typing speeds.
        </p>

        <p>
          Don't settle for boring typing drills or solitary practice sessions.
          Join the vibrant community of typeracing.io and experience the thrill
          of real-time typing competitions while enhancing your skills in a fun
          and engaging way.
        </p>
      </div>
      <MainMenu modeType="english" />
    </>
  );
}

export function RacePage({
  db,
  user,
  analytics,
}: {
  db: Firestore;
  user: User;
  analytics: Analytics;
}) {
  return (
    <>
      <Helmet>
        <title>typeracing.io | In Race</title>
        <meta name="description" content="In race! Get typing!" />
      </Helmet>
      <Race db={db} user={user} analytics={analytics} />
    </>
  );
}

export function LanguagesPage() {
  return (
    <ModeListPage
      modeTypes={["english", "français"]}
      title="typeracing.io - Languages"
      ogDescription="Select a language to race in."
      description="Select a language to race against other players in. Phrase is generated from top 500 most common words of the selected language."
    />
  );
}

export function FrenchPage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Français</title>
        <meta
          name="description"
          content="Testez vos compétences en dactylographie contre de vraies personnes du monde entier. Affrontez vos amis, suivez votre wpm et améliorez vos compétences."
        />
        <meta
          name="keywords"
          content="jeux de dactylographie gratuits, dactylographie, dactylographie, wpm, logiciel de dactylographie, jeu de dactylographie, pratique de dactylographie, programme de dactylographie gratuit, compétences de dactylographie"
        />
        <meta
          property="og:description"
          content="Compétition de courses de type en direct"
        />
      </Helmet>
      <MainMenu modeType="français" />
    </>
  );
}
