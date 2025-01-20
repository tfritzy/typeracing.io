import "./App.css";
import React, { useEffect, useState } from "react";
import { MainMenu } from "./MainMenu";
import { FirebaseError, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from "firebase/auth";
import { Spinner } from "./components/Spinner";
import { Routes, Route, BrowserRouter } from "react-router";
import { Race } from "./Race";
import { Header } from "./components/Header";

const firebaseConfig = {
  apiKey: "AIzaSyC-G5Zk64LNnZ7q7awmIcdT2I0Rys8EZp0",
  authDomain: "typeracing-io.firebaseapp.com",
  projectId: "typeracing-io",
  storageBucket: "typeracing-io.firebasestorage.app",
  messagingSenderId: "135412260528",
  appId: "1:135412260528:web:c080f77b9b1ae4394c6575",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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
      <div className="flex flex-col justify-between items-center">
        <Routes>
          <Route path="/" element={<MainMenu db={db} user={user} />} />
          <Route path="/race/:gameId" element={<Race db={db} user={user} />} />
        </Routes>
        <div />
      </div>
    </BrowserRouter>
  );
}

export default App;
