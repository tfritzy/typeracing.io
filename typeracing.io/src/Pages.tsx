import { Helmet } from "react-helmet-async";
import { Race } from "./Race";
import { Firestore } from "firebase/firestore";
import { User } from "firebase/auth";
import { Analytics } from "firebase/analytics";
import { MainMenu } from "./MainMenu";

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

export function SpanishPage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Español</title>
        <meta
          name="description"
          content="Pon a prueba tus habilidades de mecanografía contra personas reales de todo el mundo. Compite contra tus amigos, realiza un seguimiento de tus palabras por minuto y mejora tus habilidades."
        />
        <meta
          name="keywords"
          content="juegos de mecanografía gratuitos, mecanografía, mecanografía, palabras por minuto, software de mecanografía, juego de mecanografía, práctica de mecanografía, programa de mecanografía gratuito, habilidades de mecanografía"
        />
        <meta
          property="og:description"
          content="Competición de carreras tipo vivo."
        />
      </Helmet>
      <MainMenu modeType="español" />
    </>
  );
}

export function GermanPage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Deutsch</title>
        <meta
          name="description"
          content="Teste deine Tippfähigkeiten gegen echte Menschen aus der ganzen Welt. Tritt gegen deine Freunde an, verfolge deine WPM und verbessere deine Fähigkeiten."
        />
        <meta
          name="keywords"
          content="kostenlose Tippspiele, Tippen, Tastaturschreiben, WPM, Tippsoftware, Tippspiel, Tippübung, kostenloses Tippprogramm, Tippfähigkeiten"
        />
        <meta property="og:description" content="Live-Typeracing-Wettbewerb" />
      </Helmet>
      <MainMenu modeType="deutsch" />
    </>
  );
}

export function ItalianPage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Italiano</title>
        <meta
          name="description"
          content="Metti alla prova le tue abilità di digitazione contro persone reali da tutto il mondo. Competi contro i tuoi amici, tieni traccia del tuo WPM e migliora le tue abilità."
        />
        <meta
          name="keywords"
          content="giochi di digitazione gratuiti, digitazione, battitura, wpm, software di digitazione, gioco di digitazione, pratica di digitazione, programma di digitazione gratuito, abilità di digitazione"
        />
        <meta
          property="og:description"
          content="Competizione di corse di digitazione dal vivo"
        />
      </Helmet>
      <MainMenu modeType="italiano" />
    </>
  );
}

export function PortuguesePage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Português</title>
        <meta
          name="description"
          content="Teste suas habilidades de digitação contra pessoas reais de todo o mundo. Compita contra seus amigos, acompanhe seu WPM e melhore suas habilidades."
        />
        <meta
          name="keywords"
          content="jogos de digitação gratuitos, digitação, datilografia, wpm, software de digitação, jogo de digitação, prática de digitação, programa de digitação gratuito, habilidades de digitação"
        />
        <meta
          property="og:description"
          content="Competição de corrida de digitação ao vivo"
        />
      </Helmet>
      <MainMenu modeType="português" />
    </>
  );
}

export function DutchPage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Dutch</title>
        <meta
          name="description"
          content="Test je typvaardigheden tegen echte mensen van over de hele wereld. Neem het op tegen je vrienden, houd je WPM bij en verbeter je vaardigheden."
        />
        <meta
          name="keywords"
          content="gratis typspellen, typen, typewerk, wpm, typsoftware, typspel, typoefening, gratis typprogramma, typvaardigheden"
        />
        <meta property="og:description" content="Live typerace-competitie" />
      </Helmet>
      <MainMenu modeType="dutch" />
    </>
  );
}

export function PolishPage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Polski</title>
        <meta
          name="description"
          content="Sprawdź swoje umiejętności pisania na klawiaturze przeciwko prawdziwym ludziom z całego świata. Rywalizuj ze znajomymi, śledź swoje WPM i popraw swoje umiejętności."
        />
        <meta
          name="keywords"
          content="darmowe gry do pisania na klawiaturze, pisanie na klawiaturze, maszynopisanie, wpm, oprogramowanie do pisania, gra w pisanie, ćwiczenie pisania, darmowy program do pisania, umiejętności pisania"
        />
        <meta
          property="og:description"
          content="Konkurs wyścigów pisania na żywo"
        />
      </Helmet>
      <MainMenu modeType="polski" />
    </>
  );
}

export function RussianPage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Русский</title>
        <meta
          name="description"
          content="Проверьте свои навыки печати в соревновании с реальными людьми со всего мира. Соревнуйтесь с друзьями, отслеживайте свой WPM и улучшайте свои навыки."
        />
        <meta
          name="keywords"
          content="бесплатные игры для печати, печать, набор текста, wpm, программное обеспечение для печати, игра печати, практика печати, бесплатная программа печати, навыки печати"
        />
        <meta
          property="og:description"
          content="Соревнование по скоростной печати в реальном времени"
        />
      </Helmet>
      <MainMenu modeType="русский" />
    </>
  );
}

export function HindiPage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - हिंदी</title>
        <meta
          name="description"
          content="दुनिया भर के वास्तविक लोगों के खिलाफ अपने टाइपिंग कौशल का परीक्षण करें। अपने दोस्तों के साथ प्रतिस्पर्धा करें, अपने WPM को ट्रैक करें और अपने कौशल में सुधार करें।"
        />
        <meta
          name="keywords"
          content="मुफ्त टाइपिंग गेम्स, टाइपिंग, टाइपराइटिंग, wpm, टाइपिंग सॉफ्टवेयर, टाइपिंग गेम, टाइपिंग प्रैक्टिस, फ्री टाइपिंग प्रोग्राम, टाइपिंग स्किल्स"
        />
        <meta
          property="og:description"
          content="लाइव टाइप रेसिंग प्रतियोगिता"
        />
      </Helmet>
      <MainMenu modeType="हिंदी" />
    </>
  );
}

export function CopypastaPage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Copypasta Mode</title>
        <meta
          name="description"
          content="Test your typing skills with popular internet copypastas. Race against friends using viral text content and internet memes."
        />
        <meta
          name="keywords"
          content="typing game, copypasta typing, meme typing, internet copypasta, typing practice, typing test, wpm test"
        />
        <meta
          property="og:description"
          content="Live type racing with internet copypastas"
        />
      </Helmet>
      <MainMenu modeType="copypastas" />
    </>
  );
}

export function ShakespearePage() {
  return (
    <>
      <Helmet>
        <title>typeracing.io - Shakespeare Mode</title>
        <meta
          name="description"
          content="Practice typing with classical literature from William Shakespeare. Improve your typing while enjoying timeless sonnets and play excerpts."
        />
        <meta
          name="keywords"
          content="Shakespeare typing, literature typing game, classical typing practice, sonnet typing, typing test, wpm practice"
        />
        <meta
          property="og:description"
          content="Live type racing with Shakespeare's works"
        />
      </Helmet>
      <MainMenu modeType="shakespeare" />
    </>
  );
}
