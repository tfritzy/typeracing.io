import React from "react";
import {
  Arc3d,
  BookmarkBook,
  Brain,
  Copy,
  Cube,
  Home,
  MathBook,
  Message,
  MessageAlert,
  MouseButtonLeft,
  OpenSelectHandGesture,
  Running,
  Settings,
  Stretching,
  Upload,
} from "iconoir-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameMode, decodeGameMode, encodeGameMode } from "./compiled";
import { GameType, setGameType, setMode } from "./store/playerSlice";
import { Drawer } from "./Drawer";
import { Hotkey } from "./Hotkey";
import Cookies from "js-cookie";
import { Dispatch } from "redux";

type ValidGameMode = Exclude<GameMode, GameMode.Invalid>;

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
  MostCommon: {
    name: "Most common word",
    description: "The the the the the the the the the.",
    icon: <Message width={20} height={20} />,
    hotkey: "c",
  },
  LeastCommon: {
    name: "Archaic words",
    description: "Extremely archaic words.",
    icon: <Brain width={20} height={20} />,
    hotkey: "d",
  },
  CopyPastas: {
    name: "Copy pastas",
    description: "Famous copy pastas.",
    icon: <Copy width={20} height={20} />,
    hotkey: "e",
  },
  SpamTap: {
    name: "Spam tap",
    description: "Like a mouse clicking race, but keyboard.",
    icon: <MouseButtonLeft width={20} height={20} />,
    hotkey: "f",
  },
  Numbers: {
    name: "Numbers",
    description: "You know, numbers.",
    icon: <MathBook width={20} height={20} />,
    hotkey: "g",
  },
  Marathon: {
    name: "Marathon",
    description: "Painfully long phrases.",
    icon: <Running width={20} height={20} />,
    hotkey: "h",
  },
  HomeRow: {
    name: "Home row",
    description: "Words that can be typed using only the home row.",
    icon: <Home width={20} height={20} />,
    hotkey: "i",
  },
  UpperRow: {
    name: "Upper row",
    description: "Words that can be typed using only the upper row.",
    icon: <Upload width={20} height={20} />,
    hotkey: "j",
  },
  LeftHand: {
    name: "Left hand only",
    description: "Words that can be typed using only the left hand.",
    icon: (
      <div className="flip-horizontal">
        <OpenSelectHandGesture width={20} height={20} />
      </div>
    ),
    hotkey: "k",
  },
  RightHand: {
    name: "Right hand only",
    description: "Words that can be typed using only the right hand.",
    icon: <OpenSelectHandGesture width={20} height={20} />,
    hotkey: "l",
  },
  AlternatingHand: {
    name: "Alternating hand",
    description: "Words that alternate between left and right hand.",
    icon: <Arc3d width={20} height={20} />,
    hotkey: "m",
  },
  FakeWords: {
    name: "Fake words",
    description: "fwois woisn woiqun sowiqun soiwnmd.",
    icon: <MessageAlert width={20} height={20} />,
    hotkey: "n",
  },
  LongestHundred: {
    name: "Very long words",
    description: "The longest 100 words in the dictionary.",
    icon: <Stretching width={20} height={20} />,
    hotkey: "o",
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
              borderColor: "var(--accent-100)",
              borderWidth: "1px",
            }
          : {
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              borderColor: "var(--border-color)",
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
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);

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
          borderColor: isEnabled ? "var(--accent-100)" : "var(--border-color)",
          color: isEnabled ? "var(--accent)" : "var(--text-secondary)",
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
      {/* <div className="mb-4" style={{ color: SecondaryTextColor }}>
        You'll be placed in a game with the selected mode.
      </div> */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-2">{checkboxes}</div>
    </div>
  );
};

const Content = () => {
  const dispatch = useDispatch();
  const gameType = useSelector((state: RootState) => state.player.gameType);

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
    <div className="rounded-lg flex flex-col space-y-8 border-border-color">
      <div>
        <div className="font-normal mb-4">Multiplayer settings</div>
        {/* <div className="mb-4" style={{ color: SecondaryTextColor }}>
          Choose whether you want to play with others.
        </div> */}
        <div
          className="flex flex-row items-stretch w-full rounded-md bg-background-color"
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
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState<boolean>(false);
  const player = useSelector((state: RootState) => state.player);

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
        className="flex flex-row items-center border border-border-color space-x-2 rounded-full p-2 px-4 text-text-secondary focus:text-text-primary bg-neutral-color"
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
