import { useState } from "react";
import {
  Auth,
  User,
  GoogleAuthProvider,
  AuthError,
  signInWithPopup,
} from "firebase/auth";

export function AccountManagement({ auth, user }: { auth: Auth; user: User }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = async () => {
    try {
      await user.delete();
      setShowConfirm(false);
    } catch (err) {
      const error = err as AuthError;
      if (error.code === "auth/requires-recent-login") {
        // For Google Auth, we can directly trigger the re-auth popup
        try {
          const provider = new GoogleAuthProvider();
          // Ensure we get a new token by adding prompt='select_account'
          provider.setCustomParameters({ prompt: "select_account" });
          const result = await signInWithPopup(auth, provider);
          await result.user.delete();
          setShowConfirm(false);
        } catch (reauthError) {
          const error = reauthError as AuthError;
          setError(error.message);
        }
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-4 w-max">
        {error && error}

        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 border border-base-700 text-base-400 hover:text-error hover:border-error"
        >
          Close account
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center">
          <div className="bg-base-800 border border-base-700">
            <div className="px-8 py-4 text-center">
              <div className="mb-4 text-base-300 text-xl">
                Are you sure you want to close your account?
              </div>
              <div className="flex flex-row justify-center space-x-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-8 py-2 border border-base-500 rounded"
                >
                  No
                </button>
                <button
                  onClick={handleClose}
                  className="px-8 py-2 text-error border border-error rounded"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
