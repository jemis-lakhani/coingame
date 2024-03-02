import React, { useEffect, useState } from "react";
import Dot from "./Dot";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import clsx from "clsx";

const socket = io.connect("http://localhost:5000");

const NEXT_BTN_TEXT = "Move Turn to Next Player";
const NEXT_ROUND_TXT = "Start New Round";

const GameBoard = () => {
  // Params
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const teamId = searchParams.get("teamId");
  const roomId = searchParams.get("roomId");
  // Players/Game stats
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState();
  const [clickedDot, setClickedDot] = useState({});
  const [batchSize, setBatchSize] = useState(20);
  const [round, setRound] = useState("round1");
  const [isRoundCompleted, setRoundCompleted] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.emit("fetch_team_players", { teamId, roomId, round });
      socket.on(
        "team_players",
        ({ roomId: rId, teamId: tId, players, clickedDot }) => {
          if (roomId === rId && teamId === tId) {
            setPlayers(players);
            setClickedDot(clickedDot);
          }
        },
      );

      socket.on(
        "team_players_updated",
        ({ players, clickedDot, isRoundCompleted }) => {
          console.log({ players });
          console.log({ clickedDot });
          setPlayers(players);
          setClickedDot(clickedDot);
          setRoundCompleted(isRoundCompleted);
        },
      );

      return () => {
        socket.off("team_players");
      };
    }
  }, [socket]);

  useEffect(() => {
    const player = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("randomRoom1234"));
    if (player) {
      setPlayerName(player.replace("randomRoom1234=", ""));
    }
  }, []);

  const generateDot = (dotIndex, playerId, clickedDot) => {
    return (
      <Dot
        dotIndex={dotIndex}
        teamId={teamId}
        roomId={roomId}
        playerId={playerId}
        socket={socket}
        clickedDot={clickedDot}
        batchSize={batchSize}
      />
    );
  };

  const moveToNextPlayer = (playerId) => {
    socket.emit("check_for_next_turn", {
      playerId,
      teamId,
      roomId,
      batchSize,
      round,
    });
  };

  const loopArray = new Array(batchSize).fill(null);
  return (
    <div className="container max-w-[1000px] mx-auto">
      <div className="flex flex-col gap-3 mt-5">
        {players && players.length > 0
          ? players.map((p, index) => {
              return (
                <div
                  key={index}
                  className={`flex flex-col ${
                    p.name !== playerName ? "pointer-events-none" : ""
                  } bg-gray-300 p-2`}
                >
                  <span className="mb-2 ml-2">
                    {p.name}
                    {p.name === playerName ? "  (Me)" : ""}
                  </span>
                  <div
                    className={`flex items-center flex-wrap w-100 ${
                      p.isCurrentPlayer ? "visible" : "invisible"
                    }`}
                  >
                    {loopArray.map((item, index) => (
                      <div key={index} className="m-2">
                        {generateDot(index, p.id, clickedDot)}
                      </div>
                    ))}
                  </div>
                  {p.name === playerName && !p[round] && (
                    <button
                      onClick={() => moveToNextPlayer(p.id)}
                      disabled={!p.isCurrentPlayer}
                      className={
                        "rounded-lg px-4 py-2 bg-green-600 border-b-0 border-green-700 text-green-100 duration-300 disabled:opacity-50"
                      }
                    >
                      {isRoundCompleted ? NEXT_ROUND_TXT : NEXT_BTN_TEXT}
                    </button>
                  )}
                </div>
              );
            })
          : ""}
      </div>
    </div>
  );
};

export default GameBoard;
