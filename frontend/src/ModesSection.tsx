import { Checkbox } from "./Checkbox";

type Mode = {
  name: string;
  description: string;
};

const allModes = [
  {
    name: "Random words",
    description: "Words randomly selected from the 1000 most common words",
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
    name: "Arrow keys",
    description: "Random sequences of arrow keys",
  },
];

export const ModesSection = () => {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex flex-row flex-wrap">
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
