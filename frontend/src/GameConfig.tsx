import React from "react";
import { NavArrowRight } from "iconoir-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameMode } from "./compiled";
import { setModeEnabled } from "./store/playerSlice";
import { TextColor } from "./constants";

type ValidGameMode = Exclude<GameMode, GameMode.Invalid>;

let modes: Record<ValidGameMode, string> = {
  Dictionary: "Dictionary",
  Numbers: "Numbers",
  Konami: "Konami",
  Marathon: "Marathon",
  HellDiver: "HellDiver",
  HomeRow: "HomeRow",
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
      className="border rounded px-2 transition-all font-normal"
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
  const player = useSelector((state: RootState) => state.player);

  const checkboxes = [];
  for (const [key, value] of Object.entries(modes) as [GameMode, string][]) {
    checkboxes.push(
      <label
        key={key}
        className="flex flex-row space-x-1 items-center cursor-pointer"
      >
        <input
          className="cursor-pointer border-none border-transparent"
          type="checkbox"
          checked={player.enabledModes.includes(key)}
          onChange={(e) => {
            if (e.target.checked) {
              dispatch(setModeEnabled({ mode: key, enabled: true }));
            } else {
              dispatch(setModeEnabled({ mode: key, enabled: false }));
            }
          }}
        />
        <div>{value}</div>
      </label>
    );
  }

  return (
    <tr>
      <td className="text-right align-text-top pr-2">Game modes:</td>
      <td className="grid grid-cols-3 gap-x-4">{checkboxes}</td>
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
      className="transition-all border-separate border-spacing-y-3"
      style={
        shown
          ? { opacity: 1, transform: "translate(0px, 10px)" }
          : { opacity: 0, transform: "translate(0px, 0px)" }
      }
    >
      <tr>
        <td className="text-right align-text-top pr-2">Mode:</td>
        <td className="flex flex-row space-x-2">
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
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [mode, setMode] = React.useState<Mode>("Multiplayer");

  const player = useSelector((state: RootState) => state.player);

  return (
    <div className="flex flex-col space-y-2">
      <button className="flex flex-row" onClick={() => setExpanded(!expanded)}>
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
              : player.enabledModes.length + " enabled game modes"}
          </span>
        </div>
      </button>
      <Content shown={expanded} mode={mode} setMode={setMode} />
    </div>
  );
};
