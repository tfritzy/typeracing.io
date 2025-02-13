import { useState } from "react";
import { Modal } from "./Modal";
import { Auth, User } from "firebase/auth";

export function AccountManagement({ user }: { auth: Auth; user: User }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = async () => {
    await user.delete();
    setShowConfirm(false);
  };

  return (
    <>
      <div className="flex flex-row space-x-4 w-full">
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 border border-base-700 text-base-400 hover:text-error hover:border-error"
        >
          Close account
        </button>
      </div>

      <Modal
        shown={showConfirm}
        title="Close for real?"
        onClose={() => setShowConfirm(false)}
      >
        <div className="px-8 py-4">
          <div className="flex flex-row justify-center space-x-4">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 border border-base-700"
            >
              No
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-error border border-base-700"
            >
              Yes
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
