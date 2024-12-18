import { GameMode } from "../compiled";
import { RaceResult } from "../store/playerSlice";

export const calculateWpm = (
 raceResults: RaceResult[],
 mode: GameMode
) => {
 const mostRecentFiveForMode = raceResults
  .filter((result) => result.mode === mode)
  .slice(-5);
 const totalWpm = mostRecentFiveForMode.reduce(
  (acc, result) => acc + result.wpm,
  0
 );
 if (mostRecentFiveForMode.length === 0) {
  return undefined;
 }

 return (totalWpm / mostRecentFiveForMode.length).toFixed(
  0
 );
};

export function saveRaceResult(result: RaceResult) {
 const currentResults = localStorage.getItem("raceResults");
 let results: RaceResult[] = [];
 if (currentResults) {
  results = JSON.parse(currentResults);
 }
 results.push(result);
 localStorage.setItem(
  "raceResults",
  JSON.stringify(results)
 );
}
