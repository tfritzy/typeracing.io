import React, { useCallback, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from "firebase/auth";
import { Routes, Route, BrowserRouter, Navigate } from "react-router";
import { Header } from "./components/Header";
import { FindRace } from "./Pages/FindRace";
import { getAnalytics } from "firebase/analytics";
import {
  MainMenuWrapper,
  ProgrammingMainMenuWrapper,
  RacePage,
} from "./Pages/Pages";
import { Profile } from "./components/Profile";
import { PrivacyPolicy } from "./Pages/PrivacyPolicy";
import { Footer } from "./components/Footer";

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
  const [timeOffset, setTimeOffset] = useState<number>(0);

  const syncTime = async (userId: string) => {
    try {
      const docRef = doc(db, "timeSync", userId);

      await setDoc(docRef, {
        clientTime: Date.now(),
        serverTime: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      const data = snapshot.data();

      if (data?.serverTime && data?.clientTime) {
        const offset = data.serverTime.toMillis() - data.clientTime;
        setTimeOffset(offset);
      }
    } catch (error) {
      console.error("Error syncing time:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await signInAnonymously(auth);
      } else {
        setUser(user);
        await syncTime(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const getNow = useCallback(() => {
    const currentTimeMs = Date.now() + timeOffset;
    return Timestamp.fromMillis(currentTimeMs);
  }, [timeOffset]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await signInAnonymously(auth);
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

  return (
    <BrowserRouter>
      <Header />
      <div className="relative flex flex-1 flex-col max-w-[1280px] w-screen place-items-center px-16 justify-center">
        <Routes>
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route
            path="/:mode/search"
            element={<FindRace user={user} analytics={analytics} />}
          />
          <Route
            path="/:mode/:gameId"
            element={
              <RacePage
                db={db}
                user={user}
                analytics={analytics}
                getNow={getNow}
              />
            }
          />

          <Route
            path="/profile"
            element={<Profile db={db} user={user} auth={auth} />}
          />

          <Route path="/code" element={<ProgrammingMainMenuWrapper />} />
          <Route path="/code/:mode" element={<ProgrammingMainMenuWrapper />} />
          <Route path="/:mode" element={<MainMenuWrapper />} />
          <Route path="/" element={<MainMenuWrapper />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
