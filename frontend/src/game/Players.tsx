import React, { useEffect, useMemo, useState } from "react";
import { RootState } from "../store/store";
import { HelpCircle } from "iconoir-react";
import { PlayerData } from "../store/gameSlice";
import { Spinner } from "../components/Spinner";
import Tooltip from "../components/Tooltip";
import { useAppSelector, useGameSelector } from "../store/storeHooks";
import { GameStoreState } from "../store/gameStore";

const placementText = [
  <span className="font-semibold flex flex-row items-center space-x-1 pulsing-gradient-text">
    <span>1st</span>
  </span>,
  <span className="font-semibold text-base-100">2nd</span>,
  <span className="font-semibold text-base-200">3rd</span>,
  <span className="font-semibold text-base-300">4th</span>,
];

const PlayerRow = ({ player }: { player?: PlayerData }) => {
  const playerId = useAppSelector((state: RootState) => state.player.id);
  const place = useGameSelector((state: GameStoreState) =>
    state.game.placements?.findIndex((p) => p.playerId === player?.id)
  );
  const isSelf = playerId === player?.id;

  const playerName = React.useMemo(() => {
    if (player?.is_disconnected) {
      return (
        <div className="text-lg flex flex-row space-x-2 items-center">
          <span className="text-base-200 line-through">{player.name}</span>
          <span className="text-sm"> (Disconnected)</span>
        </div>
      );
    } else {
      return (
        <div className="font-normal">
          <div className="flex flex-row space-x-1 items-center">
            <div>{player?.name || <Spinner />}</div>
            {isSelf && <div className="text-base-300"> (You)</div>}
            {player?.is_bot && (
              <Tooltip content="This player is a bot. Bots are needed before/if ever this game gets a large enough playerbase. Share this game with your friends to help remove them.">
                <div key="gear" className="text-base-300">
                  <HelpCircle width={12} height={12} />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      );
    }
  }, [player, isSelf]);

  return (
    <div className="h-md relative">
      <div className="flex flex-row items-center justify-between space-x-2 w-full mb-1">
        <div className="flex text-base-200 flex-row space-x-2 items-center">
          <span>{playerName}</span>
          <span>{place !== -1 ? placementText[place] : ""} </span>
        </div>
        <div>
          {player?.most_recent_wpm.toFixed(0)}{" "}
          <span className="text-base-200">WPM</span>
        </div>
      </div>
      <div className="w-full mt-3 relative flex flex-row space-x-1">
        <div
          className="h-1 transition-all duration-350 ease-in-out rounded-full"
          style={{
            width: `${(player?.progress || 0) * 100}%`,
            backgroundColor: player?.themeColor,
          }}
        />
        <div
          className="h-1 transition-all duration-350 ease-in-out rounded-full bg-base-800"
          style={{
            width: `${(1 - (player?.progress || 0)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export const Players = () => {
  const player = useAppSelector((state: RootState) => state.player);
  const players = useGameSelector(
    (state: GameStoreState) => state.game.players
  );
  const selfIndex = players.findIndex((p) => p.id === player.id);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const playerElements = useMemo(() => {
    if (viewportHeight < 600) {
      return (
        <div className="h-full flex flex-col space-y-4">
          <PlayerRow player={players[selfIndex]} />
        </div>
      );
    } else {
      return (
        <div className="h-full flex flex-col space-y-6">
          {players.map((player, index) => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </div>
      );
    }
  }, [players, selfIndex, viewportHeight]);

  return <div className="flex flex-col space-y-6">{playerElements}</div>;
};
