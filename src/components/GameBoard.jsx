import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000");

const GameBoard = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const teamId = searchParams.get("teamId");
  const roomId = searchParams.get("roomId");
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState();

  useEffect(() => {
    socket.emit("fetch_team_players", { teamId, roomId });
    socket.on("team_players", ({ roomId: rId, teamId: tId, players }) => {
      if (roomId === rId && teamId === tId) {
        setPlayers(players);
      }
    });

    return () => {
      socket.off("team_players");
    };
  }, [teamId, roomId]);

  useEffect(() => {
    const player = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("randomRoom1234"));
    if (player) {
      setPlayerName(player.replace("randomRoom1234=", ""));
    }
  }, []);

  const generateDot = () => {
    return (
      <div className="h-12 w-12 bg-black rounded-full cursor-pointer"></div>
    );
  };

  const loopArray = new Array(20).fill(null);
  return (
    <div className="container max-w-[1000px] mx-auto">
      <div className="flex flex-col gap-3 mt-5">
        {players && players.length > 0
          ? players.map((p, index) => {
              return (
                <div key={index} className="flex flex-col bg-gray-400 p-2">
                  <span className="mb-2 ml-2">
                    {p.name}
                    {p.name === playerName ? "  (Me)" : ""}
                  </span>
                  <div className="flex items-center flex-wrap w-100">
                    {loopArray.map((item, index) => (
                      <div key={index} className="m-2">
                        {generateDot()}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          : ""}
      </div>
    </div>
  );
};

export default GameBoard;
