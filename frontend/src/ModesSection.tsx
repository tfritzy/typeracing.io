import { Checkbox } from "./Checkbox";

type Mode = {
 name: string;
 description: string;
};

const allModes = [
 {
  name: "Random words",
  description: "1000 most common English words",
 },
 {
  name: "Numbers",
  description: "Random collections of numbers",
 },
 {
  name: "Konami",
  description: "The Konami code",
 },
 {
  name: "Marathon",
  description: "A long string of random words",
 },
 {
  name: "Hell diver",
  description: "Random sequences of arrow keys",
 },
 {
  name: "Home row",
  description:
   "Only words whose letters are on the home row",
 },
];

export const ModesSection = () => {
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
     />
    ))}
   </div>
  </div>
 );
};
