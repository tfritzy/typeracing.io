import { EvPlugXmark } from "iconoir-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type DisconnectedModalProps = {
  reconnect: () => void;
};

export const DisconnectedModal = (props: DisconnectedModalProps) => {
  const [shouldShow, setShouldShow] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setTimeout(() => {
      setShouldShow(true);
    }, 500);
  }, []);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="z-50 flex flex-col min-w-96 min-h-64 fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
      <div className="p-4 flex flex-col space-y-6 grow justify-center items-center">
        <EvPlugXmark width={32} height={32} color="red" />
        <div className="text-lg">Failed to connect to game server</div>
        <div className="flex flex-row space-x-4">
          <button
            className="bg-slate-700 rounded-md border border-slate-600 px-2 py-1 font-semibold"
            onClick={() => navigate("/", { replace: true })}
            autoFocus
          >
            Go back
          </button>
          <button
            className="bg-slate-700 rounded-md border border-slate-600 px-2 py-1 font-semibold"
            onClick={props.reconnect}
            autoFocus
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};
