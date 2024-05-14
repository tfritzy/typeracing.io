const playerColors = [
 // "#fecaca",
 // "#fed7aa",
 // "#fde68a",
 // "#d9f99d",
 "#bbf7d0",
 "#a7f3d0",
 "#99f6e4",
 "#a5f3fc",
 "#bae6fd",
 "#bfdbfe",
 "#c7d2fe",
 // "#ddd6fe",
 // "#e9d5ff",
 // "#f5d0fe",
 // "#fbcfe8",
 // "#fecdd3",
];

export const getColorForPlayer = (playerId: string) => {
 const playerHash = playerId
  .split("")
  .reduce((acc, char) => acc + char.charCodeAt(0), 0);
 return playerColors[playerHash % playerColors.length];
};
