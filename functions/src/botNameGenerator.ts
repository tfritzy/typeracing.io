export class BotNames {
  static prefixes = [
    [
      "Radiant",
      "Majestic",
      "Luminous",
      "Divine",
      "Ethereal",
      "Celestial",
      "Resplendent",
      "Dazzling",
    ],
    [
      "Thick",
      "Fine",
      "Solid",
      "Exceptional",
      "Robust",
      "Sturdy",
      "Durable",
      "Excellent",
      "Premium",
    ],
    ["Crude", "Cracked"],
  ];

  static suffixes = [
    [
      "of Perfection",
      "of Nirvana",
      "of Brilliance",
      "of Enlightenment",
      "of Light",
      "of the Sun",
      "of the Ages",
    ],
    ["of the Ox", "of Stability", "", "", "", "", ""],
    ["on the Fritz", "", "", "", "", "", ""],
  ];

  static getCategoryForWpm(wpm: number) {
    if (wpm > 80) {
      return 0;
    } else if (wpm > 30) {
      return 1;
    } else {
      return 2;
    }
  }

  static generateName(wpm: number) {
    const category = this.getCategoryForWpm(wpm);
    const prefix =
      this.prefixes[category][
        Math.floor(Math.random() * this.prefixes[category].length)
      ];
    const suffix =
      this.suffixes[category][
        Math.floor(Math.random() * this.suffixes[category].length)
      ];
    return `${prefix} Typewriter ${suffix}`;
  }
}
