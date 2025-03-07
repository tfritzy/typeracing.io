import React, { useEffect, useState } from "react";
import { TypeBoxButton } from "../components/TypeBoxButton";
import { useNavigate } from "react-router-dom";
import { flatAllModes, validProgrammingModes } from "../modes";
import { ModeListPage } from "../components/ModeList";
import { GroupType, Mode, ModeType, ProgrammingLanguage } from "@shared/types";
import { Hotkey } from "../components/Hotkey";

export function MainMenu({
  modeType,
  selectableModes,
  defaultMode,
  subRoute,
}: {
  modeType: ModeType | undefined;
  selectableModes: Partial<Record<GroupType, Mode[]>>;
  defaultMode: ModeType;
  subRoute?: string;
}) {
  modeType ||= defaultMode;
  const [modeShown, setModeShown] = useState<boolean>(false);
  const navigate = useNavigate();
  const mode = flatAllModes[modeType];
  const [phrase] = React.useState(
    mode.startupPhrases[Math.floor(Math.random() * mode.startupPhrases.length)]
  );
  const isProgrammingLanguage = validProgrammingModes.has(modeType);

  const goToRoute = React.useCallback(() => {
    navigate("/" + mode.type + "/search");
  }, [mode, navigate]);

  const toggleModeShown = React.useCallback(() => {
    setModeShown(!modeShown);
  }, [modeShown]);

  const close = React.useCallback(() => {
    setModeShown(false);
  }, []);

  useEffect(() => {
    document.title = mode.name + " - TypeRacing.io";
  }, [mode.name]);

  useEffect(() => {
    const handleHotkeys = async (event: KeyboardEvent) => {
      if (event.key === "/") {
        toggleModeShown();
        event.stopPropagation();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [modeShown, toggleModeShown]);

  const borderStyle = isProgrammingLanguage
    ? "border-b border-accent w-max"
    : "border-b-2 rounded-lg px-4 py-2 border-accent w-max";

  return (
    <>
      <div className="flex flex-col items-center space-y-40">
        <div className={borderStyle}>
          <TypeBoxButton
            phrase={phrase}
            onPhraseComplete={goToRoute}
            programmingLanguage={
              isProgrammingLanguage
                ? (modeType as ProgrammingLanguage)
                : undefined
            }
          />
        </div>
        <div className="">
          <div className="relative flex flex-col space-x-1 items-center text text-base-400">
            <button
              className=" space-x-3 items-center py-2 px-5 border border-base-700 rounded-full w-max text-base-400 flex flex-row shadow-sm shadow-black/25 bg-black/10"
              onClick={toggleModeShown}
            >
              <h1 className="text-xl font-semibold">{mode.name}</h1>

              <Hotkey code="/" />
            </button>
            <ModeListPage
              modes={selectableModes}
              shown={modeShown}
              onClose={close}
              subRoute={subRoute}
              mode={modeType}
            />
          </div>
        </div>
      </div>
    </>
  );
}
