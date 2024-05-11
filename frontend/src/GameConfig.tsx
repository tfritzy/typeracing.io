import React, { useEffect } from "react";
import {
  Arc3d,
  BookmarkBook,
  Brain,
  Copy,
  Cube,
  GraduationCap,
  Home,
  Lock,
  MathBook,
  Message,
  MessageAlert,
  MouseButtonLeft,
  NetworkRight,
  OpenSelectHandGesture,
  Running,
  Settings,
  Stretching,
  Upload,
} from "iconoir-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { GameMode } from "./compiled";
import { setModeEnabled } from "./store/playerSlice";
import {
  AccentColor,
  BackgroundColor,
  BorderColor,
  NeutralColor,
  SecondaryTextColor,
  TertiaryTextColor,
  TextColor,
} from "./constants";
import { Drawer } from "./Drawer";
import { Hotkey } from "./Hotkey";

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
  icon: React.ReactNode;
  middle?: boolean;
};

const ModeButton = (props: ModeButtonProps) => {
  return (
    <button
      className="font-normal py-2 rounded w-full"
      style={
        props.selected
          ? {
              backgroundColor: AccentColor + "20",
              color: AccentColor,
              borderColor: AccentColor + "40",
              borderWidth: "1px",
            }
          : {
              backgroundColor: "transparent",
              color: SecondaryTextColor,
              borderColor: BorderColor,
              borderWidth: undefined,
            }
      }
      onClick={props.onClick}
    >
      <div className="flex flex-row items-center justify-center space-x-2">
        {props.icon}
        <div>{props.text}</div>
      </div>
    </button>
  );
};

const ModeCheckboxes = () => {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);

  const checkboxes = [];
  for (const [key, value] of Object.entries(modes) as [
    ValidGameMode,
    ModeConfig
  ][]) {
    const handleClick = () => {
      if (player.enabledModes.includes(key)) {
        dispatch(setModeEnabled({ mode: key, enabled: false }));
      } else {
        dispatch(setModeEnabled({ mode: key, enabled: true }));
      }
    };

    const isEnabled = player.enabledModes.includes(key);

    checkboxes.push(
      <button
        key={key}
        className="flex flex-row items-center space-x-2 border rounded-md p-2"
        style={{
          backgroundColor: isEnabled ? AccentColor + "20" : "transparent",
          borderColor: isEnabled ? AccentColor + "40" : TextColor + "20",
          color: isEnabled ? AccentColor : SecondaryTextColor,
        }}
        onClick={handleClick}
      >
        <div className="">{value.icon}</div>
        <div className="">{value.name}</div>
        <div className="grow" />
        <Hotkey code={value.hotkey} accent={isEnabled} />
      </button>
    );
  }

  return (
    <div>
      <div className="font-normal mb-1">Game modes</div>
      <div className="mb-4" style={{ color: SecondaryTextColor }}>
        You'll be randomly placed in a games of one of the enabled modes.
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-2">{checkboxes}</div>
    </div>
  );
};

type Mode = "Multiplayer" | "Private" | "Practice";

const Content = ({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
}) => {
  return (
    <div
      className="rounded-lg flex flex-col space-y-8"
      style={{
        borderColor: BorderColor,
      }}
    >
      <div>
        <div className="font-normal mb-1">Multiplayer settings</div>
        <div className="mb-4" style={{ color: SecondaryTextColor }}>
          Configure how/whether you want to play with others.
        </div>
        <div
          className="flex flex-row items-stretch w-full rounded-md"
          style={{
            borderColor: AccentColor + "20",
            backgroundColor: BackgroundColor,
          }}
        >
          <ModeButton
            text="Multiplayer"
            onClick={() => setMode("Multiplayer")}
            selected={mode === "Multiplayer"}
            icon={<NetworkRight width={16} height={16} />}
          />
          <ModeButton
            text="Private"
            onClick={() => setMode("Private")}
            selected={mode === "Private"}
            icon={<Lock width={16} height={16} />}
          />
          <ModeButton
            text="Practice"
            onClick={() => setMode("Practice")}
            selected={mode === "Practice"}
            icon={<GraduationCap width={16} height={16} />}
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
  const [mode, setMode] = React.useState<Mode>("Multiplayer");
  const [open, setOpen] = React.useState<boolean>(false);
  const player = useSelector((state: RootState) => state.player);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const mode = Object.keys(modes).find(
      (key) => modes[key as ValidGameMode].hotkey === e.key
    ) as ValidGameMode | undefined;

    console.log(e.key, mode, "keydown");

    if (mode) {
      if (player.enabledModes.includes(mode)) {
        dispatch(setModeEnabled({ mode, enabled: false }));
      } else {
        dispatch(setModeEnabled({ mode, enabled: true }));
      }
    }
  };

  let modesString = "";
  if (player.enabledModes.length === 1) {
    const modeName = modes[player.enabledModes[0] as ValidGameMode].name;
    modesString = modeName;
  } else {
    modesString = player.enabledModes.length + " modes";
  }

  return (
    <>
      <button
        className="flex flex-row items-center space-x-2 rounded-full p-2 px-4 text-tertiary focus:text-main"
        onClick={() => setOpen(true)}
        style={{
          backgroundColor: NeutralColor,
        }}
      >
        <Settings width={20} height={20} />
        <div>
          {mode.toString()}, {modesString}
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
            <Content mode={mode} setMode={setMode} />
          </div>
        </Drawer>
      </div>
    </>
  );
};
