export type ModeType = LanguageType | PhraseType;

export type LanguageType =
  | "english"
  | "français"
  | "español"
  | "deutsch"
  | "italiano"
  | "português"
  | "nederlands"
  | "polski"
  | "русский"
  | "日本語"
  | "中文"
  | "한국어"
  | "العربية"
  | "हिंदी"
  | "türkçe";

export type PhraseType =
  | "copypastas"
  | "shakespeare"
  | "historical-quotes"
  | "tweets"
  | "reddit-posts";

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
      description: "Copypastas, but you're not allowed to pasta",
      name: "Copypastas",
      icon: "/logos/spaghetti.svg",
    },
    {
      type: "shakespeare",
      description: "Famous Shakespeare lines",
      name: "Shakespeare",
      icon: "/logos/performing-arts.svg",
    },
    {
      type: "historical-quotes",
      description: "Phrases of famous historical quotes",
      name: "Historical Quotes",
      icon: "/logos/scroll.svg ",
    },
    {
      type: "tweets",
      description: "Famous tweets",
      name: "Tweets",
      icon: "/logos/twitter.svg",
    },
    {
      type: "reddit-posts",
      description: "Top reddit comments",
      name: "Reddit Comments",
      icon: "/logos/reddit.svg",
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
      type: "nederlands",
      name: "Nederlands",
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
      type: "日本語",
      name: "日本語",
      description: "Phrases of common Japanese words",
      icon: "/flags/jp.svg",
    },
    {
      type: "中文",
      name: "中文",
      description: "Phrases of common Chinese words",
      icon: "/flags/cn.svg",
    },
    {
      type: "한국어",
      name: "한국어",
      description: "Phrases of common Korean words",
      icon: "/flags/kr.svg",
    },
    {
      type: "العربية",
      name: "العربية",
      description: "Phrases of common Arabic words",
      icon: "/flags/sa.svg",
    },
    {
      type: "हिंदी",
      name: "हिंदी",
      description: "Phrases of common Hindi words",
      icon: "/flags/in.svg",
    },
    {
      type: "türkçe",
      name: "Türkçe",
      description: "Phrases of common Turkish words",
      icon: "/flags/tr.svg",
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
