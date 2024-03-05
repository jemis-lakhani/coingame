import React, { useEffect, useState } from "react";
import Dot from "./Dot";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import TeamTimer from "./TeamTimer";
import PlayerTimer from "./PlayerTimer";
import { Icons } from "./Icons";

const ROUND = ["round1", "round2", "round3", "round3"];
const NEXT_BTN_TEXT = "Move Turn to Next Player";
const NEXT_ROUND_TXT = "Start New Round";
const TdStyle = {
  ThStyle: `truncatew-1/6 min-w-[100px] border-l border-transparent py-4 px-2 text-lg font-medium text-white`,
  TdStyle: `truncate text-dark border-b border-l border-[#E8E8E8] bg-gray-100 dark:bg-dark-3 dark:border-dark dark:text-dark-7 py-4 px-2 text-center text-base font-medium`,
  TdStyle2: `truncate text-dark border-b border-l border-r border-[#E8E8E8] bg-white dark:border-dark dark:bg-dark-2 dark:text-dark-7 py-5 px-2 text-center text-base font-medium`,
  TdButton: `truncate inline-block px-6 py-2.5 border rounded-md border-primary text-primary hover:bg-primary hover:text-white font-medium`,
};

const socket = io.connect("http://localhost:5000");

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
  const [batchSize, setBatchSize] = useState(4);
  const [round, setRound] = useState("round1");
  const [isRoundCompleted, setRoundCompleted] = useState(false);
  const [playersTime, setPlayersTime] = useState({});
  const [isTimeUpdated, setTimeUpdated] = useState(false);
  const [startTeamTimer, setStartTeamTimer] = useState(false);
  const [startTimer, setStartTimer] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.emit("fetch_team_players", { teamId, roomId, round });
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on(
        "team_players",
        ({ roomId: rId, teamId: tId, players, clickedDot }) => {
          if (roomId === rId && teamId === tId) {
            setPlayers(players);
            setClickedDot(clickedDot);
            players.forEach((p) => {
              updatePlayerTime(p.name);
            });
            setTimeUpdated(true);
          }
        },
      );

      socket.on("team_timer_started", () => {
        if (!startTimer) {
          setStartTeamTimer(true);
        }
      });

      socket.on(
        "next_player_turn",
        ({ players, clickedDot, isRoundCompleted }) => {
          setPlayers(players);
          setClickedDot(clickedDot);
          setRoundCompleted(isRoundCompleted);
        },
      );

      socket.on("set_players_time", ({ playersTime }) => {
        setPlayersTime(playersTime);
      });

      return () => {
        socket.off("team_players_updated");
        socket.off("team_timer_started");
        socket.off("get_players_time");
        socket.off("team_players");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (isTimeUpdated) {
      const data = { playersTime, roomId, teamId };
      socket.emit("fetch_players_time", data);
      setTimeUpdated(false);
    }
  }, [isTimeUpdated]);

  const updatePlayerTime = (playerName) => {
    setPlayersTime((prevState) => ({
      ...prevState,
      [playerName]: {
        round1: "",
        round2: "",
        round3: "",
        round4: "",
      },
    }));
  };

  const handlePlayerTimer = (socketId, isStart) => {
    if (socketId === socket.id) setStartTimer(isStart);
  };

  const handlePlayerTime = (seconds, miliSeconds) => {
    if (playersTime[playerName]) {
      setPlayersTime((prevState) => {
        if (prevState[playerName]) {
          return {
            ...prevState,
            [playerName]: {
              ...prevState[playerName],
              [round]: `${seconds}.${miliSeconds}`,
            },
          };
        }
      });
      setTimeUpdated(true);
    }
  };

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
        round={round}
        socket={socket}
        clickedDot={clickedDot}
        batchSize={batchSize}
        handlePlayerTimer={handlePlayerTimer}
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
    <div className="container flex flex-row flex-wrap justify-center gap-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-6 w-full md:w-[85%] lg:w-[70%] xl:w-[50%] 2xl:w-[55%] my-5">
        {players && players.length > 0
          ? players.map((p, index) => {
              return (
                <div
                  key={index}
                  className={clsx(
                    "flex flex-col bg-white border-2 rounded-md p-2 mx-3",
                    {
                      "pointer-events-none": p.name !== playerName,
                      "ring-2 ring-green-600":
                        p.name === playerName && !p[round],
                    },
                  )}
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                  }}
                >
                  <div className="flex gap-x-2 items-center justify-between">
                    <div className="flex items-center bg-green-100 text-green-800 rounded-md whitespace-nowrap text-center leading-none p-2">
                      <Icons.user className="mr-2 h-4 w-4" />
                      {p.name}
                      {p.name === playerName ? "  (Me)" : ""}
                    </div>
                    {p[round] && (
                      <div className="p-2 text-xs rounded-md inline-block whitespace-nowrap text-center font-bold uppercase leading-none text-white">
                        <div className="flex justify-start items-center">
                          <Icons.check className="h-6 w-6" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className={clsx("flex items-center flex-wrap w-100 my-3", {
                      visible: p.isCurrentPlayer,
                      invisible: !p.isCurrentPlayer,
                    })}
                  >
                    {loopArray.map((item, index) => (
                      <div key={index} className="m-2">
                        {generateDot(index, p.id, clickedDot)}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => moveToNextPlayer(p.id)}
                    disabled={!p.isCurrentPlayer || p[round]}
                    className={clsx(
                      "flex items-center justify-center w-full bg-green-500 border-b-0 border-green-700 sm:w-auto rounded-md px-4 py-2 text-white disabled:opacity-50",
                      {
                        visible: p.name === playerName,
                        hidden: p.name !== playerName,
                      },
                    )}
                  >
                    {isRoundCompleted ? NEXT_ROUND_TXT : NEXT_BTN_TEXT}
                  </button>
                </div>
              );
            })
          : ""}
      </div>
      <div className="flex flex-col gap-6 w-full md:w-[85%] lg:w-[70%] xl:w-[35%] 2xl:w-[40%] my-5">
        <div className="flex justify-around gap-2 mx-3">
          <PlayerTimer
            startTimer={startTimer}
            handlePlayerTime={handlePlayerTime}
          />
          <TeamTimer startTimer={startTeamTimer} />
        </div>
        <section className="bg-white dark:bg-dark mx-3">
          <div className="container">
            <div className="flex flex-wrap">
              <div className="w-full ">
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="text-center bg-gray-800">
                      <tr>
                        <th className={TdStyle.ThStyle}> Player </th>
                        <th className={TdStyle.ThStyle}> Round1 </th>
                        <th className={TdStyle.ThStyle}> Round2 </th>
                        <th className={TdStyle.ThStyle}> Ronud3 </th>
                        <th className={TdStyle.ThStyle}> Round4 </th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.length > 0 &&
                        players.map((p) => {
                          return (
                            <tr key={p.id}>
                              <td className={TdStyle.TdStyle}>{p.name}</td>
                              {Object.entries(playersTime[p.name]).map(
                                ([key, value], index) => {
                                  return (
                                    <td
                                      key={index}
                                      className={TdStyle.TdStyle2}
                                    >
                                      {value}
                                    </td>
                                  );
                                },
                              )}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GameBoard;
