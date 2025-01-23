const adjectives = [
  "Stealthy",
  "Shadowy",
  "Covert",
  "Veiled",
  "Masked",
  "Mysterious",
  "Incognito",
  "Silent",
  "Camouflaged",
  "Disguised",
  "Anonymous",
  "Cloaked",
  "Ghostly",
  "Concealed",
];

const nouns = [
  "Bear",
  "Hawk",
  "Lynx",
  "Wolf",
  "Lion",
  "Deer",
  "Fox",
  "Crow",
  "Swan",
  "Snake",
  "Toad",
  "Cat",
  "Bat",
  "Frog",
  "Owl",
  "Dove",
  "Moth",
  "Wasp",
  "Crab",
];

export const generateRandomName = () => {
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
    nouns[Math.floor(Math.random() * nouns.length)]
  }`;
};
