export const playerColors = ["#e0f2fe"];

export const getColorForPlayer = (playerId: string) => {
  const playerHash = playerId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return playerColors[playerHash % playerColors.length];
};
