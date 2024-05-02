import React from "react";
import { NavArrowRight } from "iconoir-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameMode } from "./compiled";
import { setModeEnabled } from "./store/playerSlice";
import {
 BackgroundColor,
 BorderColor,
 TextColor,
} from "./constants";

type ValidGameMode = Exclude<GameMode, GameMode.Invalid>;

let modes: Record<ValidGameMode, string> = {
 Dictionary: "Dictionary",
 Numbers: "Numbers",
 Konami: "Konami",
 Marathon: "Marathon",
 HellDiver: "Hell diver",
 HomeRow: "Home row",
};

type ModeButtonProps = {
 text: string;
 selected: boolean;
 onClick: () => void;
 interactive: boolean;
};

const ModeButton = (props: ModeButtonProps) => {
 return (
  <button
   className="rounded px-3 transition-all font-normal w-max py-1"
   tabIndex={props.interactive ? 0 : -1}
   style={
    props.selected
     ? {
        backgroundColor: TextColor,
        color: "black",
        borderColor: TextColor,
       }
     : {
        backgroundColor: "transparent",
        color: TextColor,
        borderColor: TextColor,
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
  GameMode,
  string
 ][]) {
  checkboxes.push(
   <label
    key={key}
    className="flex flex-row space-x-1.5 items-center cursor-pointer"
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
    <span className="checkmark"></span>
    <div>{value}</div>
   </label>
  );
 }

 return (
  <tr>
   <td className="grid grid-cols-3 gap-x-4 gap-y-2">
    {checkboxes}
   </td>
  </tr>
 );
};

type Mode = "Multiplayer" | "Private lobby" | "Practice";

const Content = ({
 shown,
 mode,
 setMode,
}: {
 shown: boolean;
 mode: Mode;
 setMode: (mode: Mode) => void;
}) => {
 return (
  <table
   className="transition-all border-separate border-spacing-y-4 border pt-3 pb-2 px-6 rounded-lg"
   style={
    shown
     ? {
        opacity: 1,
        transform: "translate(0px, 10px)",
        borderColor: BorderColor,
       }
     : { opacity: 0, transform: "translate(0px, 0px)" }
   }
  >
   <tr>
    <td className="flex flex-row">
     <ModeButton
      text="Multiplayer"
      onClick={() => setMode("Multiplayer")}
      selected={mode === "Multiplayer"}
      interactive={shown}
     />
     <ModeButton
      text="Private lobby"
      onClick={() => setMode("Private lobby")}
      selected={mode === "Private lobby"}
      interactive={shown}
     />
     <ModeButton
      text="Practice"
      onClick={() => setMode("Practice")}
      selected={mode === "Practice"}
      interactive={shown}
     />
    </td>
   </tr>
   <ModeCheckboxes />
  </table>
 );
};

type GameConfigProps = {};

export const GameConfig = (props: GameConfigProps) => {
 const [expanded, setExpanded] =
  React.useState<boolean>(false);
 const [mode, setMode] =
  React.useState<Mode>("Multiplayer");

 const player = useSelector(
  (state: RootState) => state.player
 );

 return (
  <div className="flex flex-col-reverse items-center">
   <Content
    shown={expanded}
    mode={mode}
    setMode={setMode}
   />
   <button
    className="flex flex-row translate-y-[22px] pl-1 pr-2 space-x-1"
    onClick={() => setExpanded(!expanded)}
    style={{ backgroundColor: BackgroundColor }}
   >
    <div
     className="transition-all"
     style={
      expanded
       ? { transform: "rotate(90deg)" }
       : { transform: "rotate(0deg)" }
     }
    >
     <NavArrowRight />
    </div>

    <div className="flex flex-row space-x-2">
     <span>{mode}</span>,
     <span>
      {player.enabledModes.length === 1
       ? player.enabledModes[0]
       : player.enabledModes.length + " game modes"}
     </span>
    </div>
   </button>
  </div>
 );
};
