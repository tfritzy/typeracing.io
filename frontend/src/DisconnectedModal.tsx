import { ChillBorder, NeutralColor } from "./constants";

type DisconnectedModalProps = {
 reconnect: () => void;
 pending?: boolean;
};

export const DisconnectedModal = (
 props: DisconnectedModalProps
) => {
 return (
  <div
   className="z-50 rounded-lg flex flex-col shadow-md min-w-96 min-h-64 border fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
   style={{
    borderColor: ChillBorder,
    backgroundImage: `linear-gradient(#24292ef7, #24292ef7), url(${process.env.PUBLIC_URL}/bleh.avif)`,
    backgroundSize: "cover",
   }}
  >
   <div className="py-2 px-4 font-semibold">
    Disconnected
   </div>
   <div
    className="w-full border-b"
    style={{ borderColor: ChillBorder }}
   />
   <div className="p-4 flex flex-col space-y-3 grow justify-center items-center">
    <div>Lost connection with server.</div>
    <button
     className="bg-green-700 rounded-md border border-green-600 px-2 py-1 font-semibold"
     onClick={props.reconnect}
     autoFocus
    >
     Reconnect
    </button>
   </div>
  </div>
 );
};
