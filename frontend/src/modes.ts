import type { GroupType, Mode, ModeType } from "@shared/types";

export const allModes: Partial<Record<GroupType, Mode[]>> = {
  phrases: [
    {
      type: "copypastas",
      description: "Copypastas, but no pasta",
      name: "Copypastas",
      icon: "/logos/spaghetti.svg",
      formatting: "normal",
      startupPhrases: [
        "curse you perry the platypus",
        "number one. steady hand.",
        "you're dead, kiddo",
        "I guess they never miss, huh?",
        "DO IT, just DO IT!",
        "hello there",
        "this isn't even my final form",
        "perfectly balanced",
        "a small price to pay",
        "you fell for it fool",
        "it's dangerous to go alone",
      ],
    },
    {
      type: "shakespeare",
      description: "Famous Shakespeare lines",
      name: "Shakespeare",
      icon: "/logos/performing-arts.svg",
      formatting: "normal",
      startupPhrases: [
        "once more unto the breach",
        "cry havoc",
        "friends romans countrymen",
        "to be or not to be",
        "what fools these mortals be",
        "now is the winter of our discontent",
        "something wicked this way comes",
        "a plague on both your houses",
        "exits pursued by bear",
        "alas poor yorick",
        "double double toil and trouble",
        "the game is afoot",
        "we few we happy few",
      ],
    },
  ],
  languages: [
    {
      type: "english",
      name: "English",
      description: "Phrases of common English words",
      icon: "/flags/GB.svg",
      formatting: "normal",
      startupPhrases: [
        "glhf",
        "glgl",
        "ready for dust-off",
        "let's go",
        "commence bombardment",
        "ready to plunder",
        "fortune favors the bold",
        "let's get into the fight",
        "systems primed",
        "bring it",
        "oh, it's on",
        "let's do this",
        "it's go time",
        "it's about to get heavy",
        "put me in coach",
      ],
    },
    {
      type: "français",
      name: "Français",
      description: "Phrases of common French words",
      icon: "/flags/FR.svg",
      formatting: "normal",
      startupPhrases: [
        "en avant", // forward
        "prêt au combat", // ready for battle
        "à l'attaque", // to battle
        "allons-y", // let's go
        "en position", // in position
        "systèmes activés", // systems activated
        "c'est parti", // here we go
        "à vos ordres", // at your command
      ],
    },
    {
      type: "español",
      name: "Español",
      description: "Phrases of common Spanish words",
      icon: "/flags/ES.svg",
      formatting: "normal",
      startupPhrases: [
        "adelante", // forward
        "listos para luchar", // ready to fight
        "sistemas preparados", // systems ready
        "vamos", // let's go
        "a la batalla", // to battle
        "en posición", // in position
        "preparado", // ready
        "comenzamos", // we begin
      ],
    },
    {
      type: "deutsch",
      name: "Deutsch",
      description: "Phrases of common German words",
      icon: "/flags/DE.svg",
      formatting: "normal",
      startupPhrases: [
        "bereit machen", // get ready
        "systeme gestartet", // systems started
        "auf geht's", // here we go
        "in position", // in position
        "zum kampf", // to battle
        "vorwärts", // forward
        "angriff", // attack
        "los geht's", // let's go
      ],
    },
    {
      type: "italiano",
      name: "Italiano",
      description: "Phrases of common Italian words",
      icon: "/flags/IT.svg",
      formatting: "normal",
      startupPhrases: [
        "pronti via", // ready go
        "sistemi attivi", // systems active
        "all'attacco", // to attack
        "avanti", // forward
        "in posizione", // in position
        "iniziamo", // let's begin
        "alla battaglia", // to battle
        "andiamo", // let's go
      ],
    },
    {
      type: "português",
      name: "Português",
      description: "Phrases of common Portuguese words",
      icon: "/flags/PT.svg",
      formatting: "normal",
      startupPhrases: [
        "vamos lá", // let's go
        "sistemas prontos", // systems ready
        "em posição", // in position
        "ao ataque", // to attack
        "avançar", // advance
        "preparar", // prepare
        "começar", // begin
        "à batalha", // to battle
      ],
    },
    {
      type: "dutch",
      name: "Dutch",
      description: "Phrases of common Dutch words",
      icon: "/flags/NL.svg",
      formatting: "normal",
      startupPhrases: [
        "klaar voor actie", // ready for action
        "systemen gereed", // systems ready
        "vooruit", // forward
        "in positie", // in position
        "ten aanval", // to attack
        "beginnen", // begin
        "op ten strijd", // to battle
        "laten we gaan", // let's go
      ],
    },
    {
      type: "polski",
      name: "Polski",
      description: "Phrases of common Polish words",
      icon: "/flags/PL.svg",
      formatting: "normal",
      startupPhrases: [
        "systemy gotowe", // systems ready
        "do boju", // to battle
        "naprzód", // forward
        "na pozycji", // in position
        "zaczynamy", // we begin
        "do ataku", // to attack
        "gotowi", // ready
        "ruszamy", // let's move
      ],
    },
    {
      type: "русский",
      name: "Русский",
      description: "Phrases of common Russian words",
      icon: "/flags/RU.svg",
      formatting: "normal",
      startupPhrases: [
        "системы готовы", // systems ready
        "в бой", // to battle
        "вперёд", // forward
        "на позиции", // in position
        "начинаем", // we begin
        "в атаку", // to attack
        "готов", // ready
        "поехали", // let's go
      ],
    },
    {
      type: "हिंदी",
      name: "हिंदी",
      description: "Phrases of common Hindi words",
      icon: "/flags/IN.svg",
      formatting: "normal",
      startupPhrases: [
        "तैयार हैं", // ready
        "चलो", // let's go
        "आगे बढ़ो", // move forward
        "स्थिति में", // in position
        "युद्ध के लिए", // for battle
        "शुरू करें", // let's begin
        "हमला करो", // attack
        "प्रणाली तैयार", // system ready
      ],
    },
  ],
  programming: [
    {
      type: "python",
      name: "Python",
      description: "Snippets of python from real open source projects",
      icon: "/logos/python.png",
      formatting: "code",
      startupPhrases: [
        "def main()",
        "print('start race')",
        "Race().start()",
        "'ecar'[::-1]",
      ],
    },
    {
      type: "csharp",
      name: "C#",
      description: "Snippets of csharp from real open source projects",
      icon: "/logos/csharp.svg",
      formatting: "code",
      startupPhrases: [
        "dotnet run",
        "await Race();",
        "Console.ReadLine();",
        "await Task.WhenAll();",
        "new Race().Start();",
      ],
    },
    {
      type: "typescript",
      name: "TypeScript",
      description: "Snippets of TypeScript from real open source projects",
      icon: "/logos/typescript.svg",
      formatting: "code",
      startupPhrases: [
        "console.log('start race')",
        "new Race().start()",
        "await race()",
        "race().then(race)",
      ],
    },
  ],
};

export const programmingModes: Partial<Record<GroupType, Mode[]>> = {
  programming: allModes["programming"],
};
export const languageModes: Partial<Record<GroupType, Mode[]>> = {
  phrases: allModes["phrases"],
  languages: allModes["languages"],
};

export const flatAllModes = Object.values(allModes)
  .flatMap((group) => group)
  .reduce(
    (acc, mode) => ({
      ...acc,
      [mode.type]: mode,
    }),
    {} as Record<ModeType, Mode>
  );
export const flatLanguageModes = Object.values(languageModes)
  .flatMap((group) => group)
  .reduce(
    (acc, mode) => ({
      ...acc,
      [mode.type]: mode,
    }),
    {} as Record<ModeType, Mode>
  );
export const flatProgrammingModes = Object.values(programmingModes)
  .flatMap((group) => group)
  .reduce(
    (acc, mode) => ({
      ...acc,
      [mode.type]: mode,
    }),
    {} as Record<ModeType, Mode>
  );

export const validLanguageModes = new Set(Object.keys(flatLanguageModes));
export const validProgrammingModes: Set<string> = new Set(
  Object.keys(flatProgrammingModes)
);
