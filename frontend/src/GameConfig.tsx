import React from "react";
import { NavArrowRight } from "iconoir-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameMode } from "./compiled";
import { setModeEnabled } from "./store/playerSlice";
import {
  BackgroundColor,
  BorderColor,
  SecondaryTextColor,
  TextColor,
} from "./constants";

type ValidGameMode = Exclude<GameMode, GameMode.Invalid>;

let modes: Record<ValidGameMode, { name: string; description: string }> = {
  Dictionary: { name: "Dictionary", description: "1000 most common words" },
  Numbers: { name: "Numbers", description: "Only numbers" },
  Konami: { name: "Konami", description: "The literal konami code" },
  Marathon: { name: "Marathon", description: "Endurance test" },
  HellDiver: { name: "Hell diver", description: "Stratagem codes" },
  HomeRow: {
    name: "Home row",
    description: "Words with only home row letters",
  },
};

type ModeButtonProps = {
  text: string;
  selected: boolean;
  onClick: () => void;
  interactive: boolean;
  middle?: boolean;
};

const ModeButton = (props: ModeButtonProps) => {
  return (
    <button
      className="transition-all font-normal w-[200px] py-2 rounded"
      tabIndex={props.interactive ? 0 : -1}
      style={
        props.selected
          ? {
              backgroundColor: TextColor,
              color: BackgroundColor,
              borderColor: BorderColor,
              borderLeft: props.middle ? "1px solid" : "none",
              borderRight: props.middle ? "1px solid" : "none",
            }
          : {
              backgroundColor: "transparent",
              color: SecondaryTextColor,
              borderColor: BorderColor,
              borderLeft: props.middle ? "1px solid" : "none",
              borderRight: props.middle ? "1px solid" : "none",
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
              dispatch(setModeEnabled({ mode: key, enabled: true }));
            } else {
              dispatch(setModeEnabled({ mode: key, enabled: false }));
            }
          }}
        />
        <span className="checkmark mt-[6px]"></span>
        <div>
          <div className="">{value.name}</div>
          <div className="text-sm" style={{ color: SecondaryTextColor }}>
            {value.description}
          </div>
        </div>
      </label>
    );
  }

  return (
    <div>
      <div className="text-sm font-semibold">Game modes</div>
      <div className="text-sm mb-5" style={{ color: SecondaryTextColor }}>
        You'll be randomly placed in a games of one of the enabled modes.
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">{checkboxes}</div>
    </div>
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
    <div
      className="transition-all border p-8 px-12 rounded-lg flex flex-col"
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
      <div>
        <div className="text-sm font-semibold mb-2">Game type</div>
        <div
          className="flex flex-row w-min p-2 rounded-lg"
          style={{ borderColor: BorderColor, backgroundColor: "#00000011" }}
        >
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
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [mode, setMode] = React.useState<Mode>("Multiplayer");

  const player = useSelector((state: RootState) => state.player);

  return (
    <div className="flex flex-col">
      <button
        className="flex flex-row space-x-1 translate-y-1"
        onClick={() => setExpanded(!expanded)}
        style={{ color: SecondaryTextColor }}
      >
        <div
          className="transition-all"
          style={
            expanded
              ? { transform: "rotate(90deg)" }
              : { transform: "rotate(0deg)" }
          }
        >
          <NavArrowRight strokeWidth={1} stroke={TextColor} />
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
      <Content shown={expanded} mode={mode} setMode={setMode} />
    </div>
  );
};
