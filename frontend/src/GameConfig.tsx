import React from "react";
import {
 FindGameRequest,
 OneofRequest,
 encodeOneofRequest,
} from "./compiled";
import {
 GraduationCap,
 Lock,
 NavArrowDown,
 NavArrowRight,
} from "iconoir-react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { ModesSection } from "./ModesSection";
import { Button } from "./Button";
import { TextColor } from "./constants";
import { ProfileButton } from "./ProfileButton";

type ModeButtonProps = {
 text: string;
 selected: boolean;
 onClick: () => void;
};

const ModeButton = (props: ModeButtonProps) => {
 return (
  <button
   className="border rounded px-2 transition-all"
   style={
    props.selected
     ? { backgroundColor: "white", color: "black" }
     : { backgroundColor: "transparent", color: "white" }
   }
   onClick={props.onClick}
  >
   {props.text}
  </button>
 );
};

enum Mode {
 Multiplayer,
 PrivateLobby,
 Practice,
}

const Content = ({ shown }: { shown: boolean }) => {
 const [mode, setMode] = React.useState<Mode>(
  Mode.Multiplayer
 );

 return (
  <div>
   <div
    className="flex flex-row space-x-3 transition-all"
    hidden={!shown}
    style={
     shown
      ? { opacity: 1, transform: "translate(0px, 10px)" }
      : { opacity: 0, transform: "translate(0px, 0px)" }
    }
   >
    <div>Mode:</div>
    <ModeButton
     text="Multiplayer"
     onClick={() => setMode(Mode.Multiplayer)}
     selected={mode === Mode.Multiplayer}
    />
    <ModeButton
     text="Private lobby"
     onClick={() => setMode(Mode.PrivateLobby)}
     selected={mode === Mode.PrivateLobby}
    />
    <ModeButton
     text="Practice"
     onClick={() => setMode(Mode.Practice)}
     selected={mode === Mode.Practice}
    />
   </div>
  </div>
 );
};

type GameConfigProps = {};

export const GameConfig = (props: GameConfigProps) => {
 const [expanded, setExpanded] =
  React.useState<boolean>(false);

 const player = useSelector(
  (state: RootState) => state.player
 );

 return (
  <div className="flex flex-col items-center space-y-2">
   <button
    className="flex flex-row"
    onClick={() => setExpanded(!expanded)}
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

    <div>All the stuff</div>
   </button>
   <Content shown={expanded} />
  </div>
 );
};
