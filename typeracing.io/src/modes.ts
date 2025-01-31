export type ModeType = "english" | "français";

export type Mode = {
  name: string;
  description: string;
  icon: string;
};

export const modes: Record<ModeType, Mode> = {
  ["english"]: {
    name: "English",
    description: "500 most common English words",
    icon: "/flags/GB.svg",
  },
  ["français"]: {
    name: "Français",
    description: "500 most common French words",
    icon: "/flags/FR.svg",
  },
};
