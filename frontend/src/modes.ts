export type ModeType = LanguageType | PhraseType;

export type LanguageType =
  | "english"
  | "français"
  | "español"
  | "deutsch"
  | "italiano"
  | "português"
  | "dutch"
  | "polski"
  | "русский"
  | "हिंदी";

export type PhraseType = "copypastas" | "shakespeare";

export type GroupType = "languages" | "phrases";

export type Mode = {
  name: string;
  description: string;
  icon: string;
  type: ModeType;
};

export const groupedModes: Record<GroupType, Mode[]> = {
  phrases: [
    {
      type: "copypastas",
      description: "Copypastas, but no pasta",
      name: "Copypastas",
      icon: "/logos/spaghetti.svg",
    },
    {
      type: "shakespeare",
      description: "Famous Shakespeare lines",
      name: "Shakespeare",
      icon: "/logos/performing-arts.svg",
    },
  ],
  languages: [
    {
      type: "english",
      name: "English",
      description: "Phrases of common English words",
      icon: "/flags/gb.svg",
    },
    {
      type: "français",
      name: "Français",
      description: "Phrases of common French words",
      icon: "/flags/fr.svg",
    },
    {
      type: "español",
      name: "Español",
      description: "Phrases of common Spanish words",
      icon: "/flags/es.svg",
    },
    {
      type: "deutsch",
      name: "Deutsch",
      description: "Phrases of common German words",
      icon: "/flags/de.svg",
    },
    {
      type: "italiano",
      name: "Italiano",
      description: "Phrases of common Italian words",
      icon: "/flags/it.svg",
    },
    {
      type: "português",
      name: "Português",
      description: "Phrases of common Portuguese words",
      icon: "/flags/pt.svg",
    },
    {
      type: "dutch",
      name: "Dutch",
      description: "Phrases of common Dutch words",
      icon: "/flags/nl.svg",
    },
    {
      type: "polski",
      name: "Polski",
      description: "Phrases of common Polish words",
      icon: "/flags/pl.svg",
    },
    {
      type: "русский",
      name: "Русский",
      description: "Phrases of common Russian words",
      icon: "/flags/ru.svg",
    },
    {
      type: "हिंदी",
      name: "हिंदी",
      description: "Phrases of common Hindi words",
      icon: "/flags/in.svg",
    },
  ],
};

export const flatModes = Object.values(groupedModes)
  .flatMap((group) => group)
  .reduce(
    (acc, mode) => ({
      ...acc,
      [mode.type]: mode,
    }),
    {} as Record<ModeType, Mode>
  );
