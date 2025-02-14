import {
  Auth,
  GoogleAuthProvider,
  linkWithPopup,
  OAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { useCallback } from "react";

export function AuthLine({ auth, user }: { auth: Auth; user: User }) {
  const signIn = useCallback(async () => {
    try {
      if (auth.currentUser?.isAnonymous) {
        try {
          await linkWithPopup(auth.currentUser, new GoogleAuthProvider());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          if (error.code === "auth/credential-already-in-use") {
            const credential = OAuthProvider.credentialFromError(error);
            if (credential) {
              await signInWithCredential(auth, credential);
            }
          }
        }
      } else {
        await signInWithPopup(auth, new GoogleAuthProvider());
      }
      //   setIsAnnon(false);
    } catch (error) {
      console.error(error);
    }
  }, [auth]);

  const so = useCallback(() => {
    signOut(auth);
  }, [auth]);

  if (user.isAnonymous) {
    return (
      <div className="text-base-400">
        Anonymous account.{" "}
        <button className="text-accent" onClick={signIn}>
          Sign in
        </button>{" "}
        to save your scores.
      </div>
    );
  } else {
    return (
      <div className="text-base-400">
        Signed in as {user.email}.{" "}
        <button onClick={so}>
          <b>Sign out</b>
        </button>
        .
      </div>
    );
  }
}
