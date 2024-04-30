import { useDispatch, useSelector } from "react-redux";
import { Checkbox } from "./Checkbox";
import { RootState } from "./store/store";
import { GameMode } from "./compiled";
import { setModeEnabled } from "./store/playerSlice";

type Mode = {
 name: string;
 description: string;
 type: GameMode;
};

const allModes = [
 {
  name: "Random words",
  description: "1000 most common English words",
  type: GameMode.Dictionary,
 },
 {
  name: "Numbers",
  description: "Random collections of numbers",
  type: GameMode.Numbers,
 },
 {
  name: "Konami",
  description: "The Konami code",
  type: GameMode.Konami,
 },
 {
  name: "Marathon",
  description: "A long string of random words",
  type: GameMode.Marathon,
 },
 {
  name: "Hell diver",
  description: "Random sequences of arrow keys",
  type: GameMode.HellDiver,
 },
 {
  name: "Home row",
  description:
   "Only words whose letters are on the home row",
  type: GameMode.HomeRow,
 },
];

export const ModesSection = () => {
 const dispatch = useDispatch();
 const enabledModes = useSelector(
  (state: RootState) => state.player.enabledModes
 );

 return (
  <div className="flex flex-col space-y-4 w-full">
   <div>
    <h2>Enabled modes</h2>
    <div className="text-sm">
     You will be randomly placed in games of one of the
     enabled game modes.
    </div>
   </div>
   <div className="grid grid-cols-2 gap-2 max-w-[600px]">
    {allModes.map((mode: Mode, index: number) => (
     <Checkbox
      label={mode.name}
      description={mode.description}
      id={mode.name}
      checked={enabledModes.includes(mode.type)}
      setChecked={(checked: boolean) => {
       dispatch(
        setModeEnabled({
         mode: mode.type,
         enabled: checked,
        })
       );
      }}
     />
    ))}
   </div>
  </div>
 );
};
