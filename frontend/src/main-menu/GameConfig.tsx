import React from "react";
import {
  Arc3d,
  BookmarkBook,
  Brain,
  Copy,
  Cube,
  Home,
  MathBook,
  OpenSelectHandGesture,
  Running,
  Settings,
  Upload,
} from "iconoir-react";
import { RootState } from "../store/store";
import { GameMode, decodeGameMode, encodeGameMode } from "../compiled";
import { GameType, setGameType, setMode } from "../store/playerSlice";
import { Drawer } from "../components/Drawer";
import { Hotkey } from "../components/Hotkey";
import Cookies from "js-cookie";
import { Dispatch } from "redux";
import { useAppDispatch, useAppSelector } from "../store/storeHooks";

type ValidGameMode =
  | GameMode.Common
  | GameMode.Dictionary
  | GameMode.LeastCommon
  | GameMode.CopyPastas
  | GameMode.Numbers
  | GameMode.Marathon
  | GameMode.HomeRow
  | GameMode.UpperRow
  | GameMode.LeftHand
  | GameMode.RightHand
  | GameMode.AlternatingHand;

type ModeConfig = {
  name: string;
  description: string;
  icon: React.ReactNode;
  hotkey: string;
};

let modes: Record<ValidGameMode, ModeConfig> = {
  Common: {
    name: "Common words",
    description: "Sampled from the 100 most common words.",
    icon: <Cube width={20} height={20} />,
    hotkey: "a",
  },
  Dictionary: {
    name: "Entire dictionary",
    description: "Random words from the entire dictionary.",
    icon: <BookmarkBook width={20} height={20} />,
    hotkey: "b",
  },
  LeastCommon: {
    name: "Archaic words",
    description: "Extremely archaic words.",
    icon: <Brain width={20} height={20} />,
    hotkey: "c",
  },
  CopyPastas: {
    name: "Copy pastas",
    description: "Famous copy pastas.",
    icon: <Copy width={20} height={20} />,
    hotkey: "d",
  },
  Numbers: {
    name: "Numbers",
    description: "You know, numbers.",
    icon: <MathBook width={20} height={20} />,
    hotkey: "e",
  },
  Marathon: {
    name: "Marathon",
    description: "Painfully long phrases.",
    icon: <Running width={20} height={20} />,
    hotkey: "f",
  },
  HomeRow: {
    name: "Home row",
    description: "Words that can be typed using only the home row.",
    icon: <Home width={20} height={20} />,
    hotkey: "g",
  },
  UpperRow: {
    name: "Upper row",
    description: "Words that can be typed using only the upper row.",
    icon: <Upload width={20} height={20} />,
    hotkey: "h",
  },
  LeftHand: {
    name: "Left hand only",
    description: "Words that can be typed using only the left hand.",
    icon: (
      <div className="flip-horizontal">
        <OpenSelectHandGesture width={20} height={20} />
      </div>
    ),
    hotkey: "i",
  },
  RightHand: {
    name: "Right hand only",
    description: "Words that can be typed using only the right hand.",
    icon: <OpenSelectHandGesture width={20} height={20} />,
    hotkey: "j",
  },
  AlternatingHand: {
    name: "Alternating hand",
    description: "Words that alternate between left and right hand.",
    icon: <Arc3d width={20} height={20} />,
    hotkey: "k",
  },
};

type ModeButtonProps = {
  text: string;
  selected: boolean;
  onClick: () => void;
};

const ModeButton = (props: ModeButtonProps) => {
  return (
    <button
      className="font-normal py-2 rounded w-full"
      style={
        props.selected
          ? {
              backgroundColor: "var(--accent-200)",
              color: "var(--accent)",
              borderColor: "var(--accent-800)",
              borderWidth: "1px",
            }
          : {
              backgroundColor: "transparent",
              color: "var(--base-200)",
              borderColor: "var(--base-600)",
              borderWidth: undefined,
            }
      }
      onClick={props.onClick}
    >
      <div className="flex flex-row items-center justify-center space-x-2">
        <div>{props.text}</div>
        {/* {props.icon} */}
      </div>
    </button>
  );
};

const selectGameMode = (mode: GameMode, dispatch: Dispatch) => {
  const modeNum = encodeGameMode[mode];
  dispatch(setMode(mode));
  Cookies.set("gameMode", modeNum.toString(), {
    sameSite: "strict",
    expires: 365,
  });
};

const ModeCheckboxes = () => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state: RootState) => state.player);

  React.useEffect(() => {
    let setModes = false;
    const gameMode = Cookies.get("gameMode");
    if (gameMode) {
      const parsedMode = decodeGameMode[parseInt(gameMode)];

      if (parsedMode !== GameMode.Invalid) {
        setModes = true;
        dispatch(setMode(parsedMode));
      }
    }

    if (!setModes) {
      dispatch(setMode(GameMode.Common));
    }
  }, [dispatch]);

  const checkboxes = [];
  for (const [key, value] of Object.entries(modes) as [
    ValidGameMode,
    ModeConfig
  ][]) {
    const isEnabled = player.gameMode === key;

    checkboxes.push(
      <button
        key={key}
        className="flex flex-row items-center space-x-2 border rounded-md p-2"
        style={{
          backgroundColor: isEnabled ? "var(--accent-200)" : "transparent",
          borderColor: isEnabled ? "var(--accent-800)" : "var(--base-600)",
          color: isEnabled ? "var(--accent)" : "var(--base-200)",
        }}
        onClick={() => selectGameMode(key, dispatch)}
      >
        {/* <div className="">{value.icon}</div> */}
        <div className="">{value.name}</div>
        <div className="grow" />
        <Hotkey code={value.hotkey} accent={isEnabled} />
      </button>
    );
  }

  return (
    <div>
      <div className="font-normal mb-4 ">Game modes</div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-2">{checkboxes}</div>
    </div>
  );
};

const Content = () => {
  const dispatch = useAppDispatch();
  const gameType = useAppSelector((state: RootState) => state.player.gameType);

  React.useEffect(() => {
    let gameType = Cookies.get("gameType");
    if (gameType) {
      dispatch(setGameType(gameType as GameType));
    }
  }, [dispatch]);

  const selectGameType = React.useCallback(
    (type: GameType) => {
      dispatch(setGameType(type));
      Cookies.set("gameType", type, {
        sameSite: "strict",
        expires: 365,
      });
    },
    [dispatch]
  );

  return (
    <div className="rounded-lg flex flex-col space-y-8 border-base-600">
      <div>
        <div className="font-normal mb-4">Multiplayer settings</div>
        <div
          className="flex flex-row items-stretch w-full rounded-md bg-base-800"
          style={{
            borderColor: "var(--accent-200)",
          }}
        >
          <ModeButton
            text="Multiplayer"
            onClick={() => selectGameType("Multiplayer")}
            selected={gameType === "Multiplayer"}
          />
          <ModeButton
            text="Practice"
            onClick={() => selectGameType("Practice")}
            selected={gameType === "Practice"}
          />
        </div>
      </div>
      <ModeCheckboxes />
    </div>
  );
};

type GameConfigProps = { onClose: () => void };
export const GameConfig = (props: GameConfigProps) => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState<boolean>(false);
  const player = useAppSelector((state: RootState) => state.player);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const mode = Object.keys(modes).find(
      (key) => modes[key as ValidGameMode].hotkey === e.key
    ) as ValidGameMode | undefined;

    if (mode) {
      selectGameMode(mode, dispatch);
    }
  };

  let modesString = `${modes[player.gameMode as ValidGameMode].name}`;

  return (
    <>
      <button
        className="flex flex-row items-center border border-base-600 space-x-2 rounded-full p-2 px-4 text-base-200 focus:text-base-100 bg-base-900 shadow-sm shadow-shadow-color"
        onClick={() => setOpen(true)}
      >
        <Settings width={20} height={20} />
        <div>
          {player.gameType.toString()}, {modesString}
        </div>
      </button>

      <div onKeyDown={handleKeyDown}>
        <Drawer
          title="Game settings"
          open={open}
          onClose={() => {
            setOpen(false);
            props.onClose();
          }}
        >
          <div className="p-4">
            <Content />
          </div>
        </Drawer>
      </div>
    </>
  );
};
