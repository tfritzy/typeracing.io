import React from "react";
import {
 EditPencil,
 NavArrowRight,
 X,
 Xmark,
} from "iconoir-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameMode } from "./compiled";
import { setModeEnabled } from "./store/playerSlice";
import {
 BackgroundColor,
 BorderColor,
 NeutralColor,
 SecondaryTextColor,
 TextColor,
} from "./constants";

type ValidGameMode = Exclude<GameMode, GameMode.Invalid>;

let modes: Record<
 ValidGameMode,
 { name: string; description: string }
> = {
 Dictionary: {
  name: "Dictionary",
  description: "1000 most common words",
 },
 Numbers: { name: "Numbers", description: "Only numbers" },
 Konami: {
  name: "Konami",
  description: "The literal konami code",
 },
 Marathon: {
  name: "Marathon",
  description: "Endurance test",
 },
 HellDiver: {
  name: "Hell diver",
  description: "Stratagem codes",
 },
 HomeRow: {
  name: "Home row",
  description: "Words with only home row letters",
 },
};

type ModeButtonProps = {
 text: string;
 selected: boolean;
 onClick: () => void;
 middle?: boolean;
};

const ModeButton = (props: ModeButtonProps) => {
 return (
  <button
   className="transition-all py-2 rounded w-32"
   style={
    props.selected
     ? {
        backgroundColor: TextColor,
        color: BackgroundColor,
        borderColor: BorderColor,
        borderLeft: props.middle ? "1px solid" : "none",
        borderRight: props.middle ? "1px solid" : "none",
        fontWeight: 600,
       }
     : {
        backgroundColor: "transparent",
        color: SecondaryTextColor,
        borderColor: BorderColor,
        borderLeft: props.middle ? "1px solid" : "none",
        borderRight: props.middle ? "1px solid" : "none",
        fontWeight: 400,
       }
   }
   onClick={props.onClick}
  >
   {props.text}
  </button>
 );
};

const ModeCheckboxes = () => {
 const dispatch = useDispatch();
 const player = useSelector(
  (state: RootState) => state.player
 );

 const checkboxes = [];
 for (const [key, value] of Object.entries(modes) as [
  ValidGameMode,
  { name: string; description: string }
 ][]) {
  checkboxes.push(
   <label
    key={key}
    className="flex flex-row space-x-2 items-start cursor-pointer"
   >
    <input
     className="cursor-pointer"
     type="checkbox"
     checked={player.enabledModes.includes(key)}
     onChange={(e) => {
      if (e.target.checked) {
       dispatch(
        setModeEnabled({ mode: key, enabled: true })
       );
      } else {
       dispatch(
        setModeEnabled({ mode: key, enabled: false })
       );
      }
     }}
    />
    <span className="checkmark mt-[6px]"></span>
    <div>
     <div className="">{value.name}</div>
     <div
      className="text-sm"
      style={{ color: SecondaryTextColor }}
     >
      {value.description}
     </div>
    </div>
   </label>
  );
 }

 return (
  <div>
   <div className="text-sm font-normal">Game modes</div>
   <div
    className="text-sm mb-5"
    style={{ color: SecondaryTextColor }}
   >
    You'll be randomly placed in a games of one of the
    enabled modes.
   </div>
   <div className="grid grid-cols-2 gap-x-4 gap-y-2">
    {checkboxes}
   </div>
  </div>
 );
};

type Mode = "Multiplayer" | "Private lobby" | "Practice";

const Content = ({
 mode,
 setMode,
}: {
 mode: Mode;
 setMode: (mode: Mode) => void;
}) => {
 return (
  <div
   className="transition-all rounded-lg flex flex-col"
   style={{
    borderColor: BorderColor,
   }}
  >
   <div>
    <div className="text-sm font-normal mb-2">
     Game type
    </div>
    <div
     className="flex flex-row items-stretch rounded-lg w-min"
     style={{
      borderColor: BorderColor,
      backgroundColor: NeutralColor,
     }}
    >
     <ModeButton
      text="Multiplayer"
      onClick={() => setMode("Multiplayer")}
      selected={mode === "Multiplayer"}
     />
     <ModeButton
      text="Private lobby"
      onClick={() => setMode("Private lobby")}
      selected={mode === "Private lobby"}
     />
     <ModeButton
      text="Practice"
      onClick={() => setMode("Practice")}
      selected={mode === "Practice"}
     />
    </div>
   </div>
   <div
    className="border-b w-full mt-6 mb-5"
    style={{ borderColor: BorderColor }}
   />
   <ModeCheckboxes />
  </div>
 );
};

type GameConfigProps = {};

export const GameConfig = (props: GameConfigProps) => {
 const [mode, setMode] =
  React.useState<Mode>("Multiplayer");
 const [open, setOpen] = React.useState<boolean>(false);
 const player = useSelector(
  (state: RootState) => state.player
 );

 let modesString = "";
 if (player.enabledModes.length === 1) {
  modesString = player.enabledModes[0].toString();
 } else {
  modesString = player.enabledModes.length + " modes";
 }

 return (
  <div className="fixed w-full items-center bg-amber-200 left-0 bottom-0 flex flex-col transition-all">
   {!open && (
    <button
     className="flex flex-row items-center space-x-1 text-lg font-normal"
     onClick={() => setOpen(true)}
     style={{ color: BackgroundColor }}
    >
     <EditPencil width={22} height={22} />
     <div>
      {mode.toString()}, {modesString}
     </div>
    </button>
   )}
   {open && (
    <div className="fixed w-screen bottom-0 left-0 bg-[#00000022] p-4">
     <button
      className="absolute top-2 right-2"
      onClick={() => setOpen(false)}
     >
      <Xmark />
     </button>
     <div className="flex w-full flex-col justify-center max-w-[800px]">
      <Content mode={mode} setMode={setMode} />
     </div>
    </div>
   )}
  </div>
 );
};
