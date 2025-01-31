import React, { useEffect, useState } from "react";
import { FirebaseError, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from "firebase/auth";
import { Spinner } from "./components/Spinner";
import { Routes, Route, BrowserRouter, Navigate } from "react-router";
import { Header } from "./components/Header";
import { FindRace } from "./FindRace";
import { getAnalytics } from "firebase/analytics";
import { HelmetProvider } from "react-helmet-async";
import { FrenchPage, HomePage, LanguagesPage, RacePage } from "./Pages";

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
    <HelmetProvider>
      <BrowserRouter>
        <Header />
        <div className="relative flex flex-1 flex-col max-w-[1280px] w-screen mx-2 place-items-center justify-center m-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/race/"
              element={<FindRace user={user} analytics={analytics} />}
            />
            <Route
              path="/race/:gameId"
              element={<RacePage db={db} user={user} analytics={analytics} />}
            />

            <Route path="/languages" element={<LanguagesPage />} />
            <Route path="/languages/français" element={<FrenchPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
