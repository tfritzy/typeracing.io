import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { PlayerData } from "./App";

const PlayerRow = ({ player }: { player: PlayerData }) => {
  let playerName;
  if (player.is_disconnected) {
    playerName = (
      <div className="text-white text-lg">
        <span className="line-through">{player.name}</span>
        <span className="text-sm"> (Disconnected)</span>
      </div>
    );
  } else {
    playerName = (
      <div className="text-white text-lg font-thin">{player.name}</div>
    );
  }

  return (
    <div className="h-md relative">
      {playerName}
      <div
        className="w-full h-2 rounded-full mt-2 bg-neutral-800"
        style={{
          backgroundColor: "#161a1d",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-350 ease-in-out"
          style={{
            width: `${player.progress * 100}%`,
            backgroundColor: player.themeColor,
          }}
        ></div>
      </div>
    </div>
  );
};

export const Players = () => {
  const playerData = useSelector((state: RootState) => state.player);
  const players = useSelector((state: RootState) => state.game.players);
  const selfIndex = players.findIndex((player) => player.id === playerData.id);
  const positionRefs = useRef<number[]>([]);

  useEffect(() => {
    positionRefs.current = [];
    for (let i = 0; i < players.length; i++) {
      positionRefs.current.push(players[i].position_km);
    }
  }, [players]);

  useEffect(() => {
    let frameId: number;
    let lastTime: number = Date.now();

    if (selfIndex === -1) {
      return;
    }

    const animate = () => {
      const deltaTime_s = (Date.now() - lastTime) / 1000;
      lastTime = Date.now();

      while (positionRefs.current.length < players.length) {
        positionRefs.current.push(0);
      }

      for (let i = 0; i < players.length; i++) {
        positionRefs.current[i] += players[i].velocity_km_s * deltaTime_s;
      }
      let ownPos = positionRefs.current[selfIndex];
      const deltas = [];
      for (let i = 0; i < players.length; i++) {
        deltas.push(positionRefs.current[i] - ownPos);
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      {players.map((player) => (
        <PlayerRow key={player.id} player={player} />
      ))}
    </div>
  );
};
