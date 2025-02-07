import React, { useEffect, useState } from "react";
import { FirebaseError, initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from "firebase/auth";
import { Spinner } from "./components/Spinner";
import { Routes, Route, BrowserRouter, Navigate } from "react-router";
import { Header } from "./components/Header";
import { FindRace } from "./Pages/FindRace";
import { getAnalytics } from "firebase/analytics";
import {
  CopypastaPage,
  DutchPage,
  FrenchPage,
  GermanPage,
  HindiPage,
  HomePage,
  ItalianPage,
  PolishPage,
  PortuguesePage,
  RacePage,
  RussianPage,
  ShakespearePage,
  SpanishPage,
} from "./Pages/Pages";
import { Profile } from "./components/Profile";

const firebaseConfig = {
  apiKey: "AIzaSyC-G5Zk64LNnZ7q7awmIcdT2I0Rys8EZp0",
  authDomain: "typeracing-io.firebaseapp.com",
  projectId: "typeracing-io",
  storageBucket: "typeracing-io.firebasestorage.app",
  messagingSenderId: "135412260528",
  appId: "1:135412260528:web:c080f77b9b1ae4394c6575",
  measurementId: "G-Q913VW55CC",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

if (process.env.NODE_ENV === "development") {
  connectFirestoreEmulator(db, "localhost", 8090);
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          const credential = await signInAnonymously(auth);
          setUser(credential.user);
        } catch (err) {
          const errorMessage =
            (err as FirebaseError).message || "Authentication failed";
          console.error(errorMessage);
        }
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, []);

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
  }, []);

  if (!user) {
    return <Spinner />;
  }

  return (
    <BrowserRouter>
      <Header />
      <div className="relative flex flex-1 flex-col max-w-[1280px] w-screen px-32 place-items-center justify-center m-auto overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/search/:mode"
            element={<FindRace user={user} analytics={analytics} />}
          />
          <Route
            path="/race/:gameId"
            element={<RacePage db={db} user={user} analytics={analytics} />}
          />

          <Route path="/profile" element={<Profile />} />

          <Route path="/français" element={<FrenchPage />} />
          <Route path="/español" element={<SpanishPage />} />
          <Route path="/deutsch" element={<GermanPage />} />
          <Route path="/italiano" element={<ItalianPage />} />
          <Route path="/português" element={<PortuguesePage />} />
          <Route path="/dutch" element={<DutchPage />} />
          <Route path="/polski" element={<PolishPage />} />
          <Route path="/русский" element={<RussianPage />} />
          <Route path="/हिंदी" element={<HindiPage />} />

          <Route path="/copypastas" element={<CopypastaPage />} />
          <Route path="/shakespeare" element={<ShakespearePage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
