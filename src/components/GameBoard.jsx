import React, { useEffect, useState } from "react";
import Dot from "./Dot";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import TeamTimer from "./TeamTimer";
import PlayerTimer from "./PlayerTimer";
import { Icons } from "./Icons";

const BATCH_SIZE = {
  round1: 4,
  round2: 2,
  round3: 2,
  round4: 1,
};
const NEXT_BTN_TEXT = "Move Turn to Next Player";
const TdStyle = {
  ThStyle: `truncatew-1/6 min-w-[100px] border-l border-transparent py-4 px-2 text-lg font-medium text-white`,
  TdStyle: `truncate text-dark border-b border-l border-[#E8E8E8] bg-gray-200 py-4 px-2 text-center text-base font-medium`,
  TdStyle2: `truncate text-dark border-b border-l border-r border-[#E8E8E8] bg-white py-5 px-2 text-center text-base font-medium`,
  TdButton: `truncate inline-block px-6 py-2.5 border rounded-md border-primary text-primary hover:bg-primary hover:text-white font-medium`,
};

const socket = io.connect("http://localhost:5000");

const GameBoard = () => {
  // Params
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const teamId = searchParams.get("teamId");
  const roomId = searchParams.get("roomId");
  const isFaciliator = searchParams.get("f") === "me";
  // Players/Game stats
  const totalSize = 4;
  const [players, setPlayers] = useState([]);
  const [clickedDots, setClickedDots] = useState({});
  const [playerName, setPlayerName] = useState();
  const [batchSize, setBatchSize] = useState(4);
  const [round, setRound] = useState("round1");
  const [playersTime, setPlayersTime] = useState({
    round1: { first: "", total: "" },
    round2: { first: "", total: "" },
    round3: { first: "", total: "" },
    round4: { first: "", total: "" },
  });
  const [isNextTurnEnabled, setNextTurnEnabled] = useState(false);
  const [completedDots, setCompletedDots] = useState(0);
  const [isFetchedPlayersTime, setFetchedPlayersTime] = useState(false);

  // Fetch team players
  useEffect(() => {
    if (socket) {
      socket.emit("fetch_team_players", { teamId, roomId, round });
    }
  }, []);

  // Set Team Players
  useEffect(() => {
    socket.on(
      "team_players",
      ({ roomId: rId, teamId: tId, players, clickedDots }) => {
        if (roomId === rId && teamId === tId) {
          players.forEach((p) => {
            updatePlayerTime(p.name);
          });
          setPlayers(players);
          setClickedDots(clickedDots);
          setFetchedPlayersTime(true);
        }
      },
    );

    return () => {
      socket.off("team_players");
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on(
        "next_player_turn",
        ({ teamPlayers, clickedDots, roundCompleted, isLastPlayer }) => {
          setPlayers(teamPlayers);
          setClickedDots(clickedDots);
          if (roundCompleted) {
            setCompletedDots(4);
          } else if (isLastPlayer) {
            const dots = Math.min(completedDots + batchSize, 4);
            setCompletedDots(dots);
          }
        },
      );

      socket.on("manage_next_turn", ({ isNextEnabled }) => {
        setNextTurnEnabled(isNextEnabled);
      });

      socket.on("set_players_time", ({ playersTime }) => {
        setPlayersTime(playersTime);
      });

      return () => {
        socket.off("team_timer_started");
        socket.off("next_player_turn");
        socket.off("set_players_time");
        socket.off("manage_next_turn");
      };
    }
  }, [socket, batchSize, completedDots]);

  // New Round
  useEffect(() => {
    socket.on("start_new_round", ({ players, clickedDots, nextRound }) => {
      setRound(nextRound);
      setClickedDots(clickedDots);
      setPlayers(players);
      setBatchSize(BATCH_SIZE[nextRound]);
      setCompletedDots(0);
      setNextTurnEnabled(false);
    });
    return () => {
      socket.off("start_new_round");
    };
  }, [socket, batchSize]);

  // Fetch Players Time
  useEffect(() => {
    if (isFetchedPlayersTime) {
      setFetchedPlayersTime(false);
      const data = { playersTime, teamId };
      socket.emit("fetch_players_time", data);
    }
  }, [playersTime, teamId, isFetchedPlayersTime]);

  // Cookie
  useEffect(() => {
    const player = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("randomRoom1234"));
    if (player) {
      setPlayerName(player.replace("randomRoom1234=", ""));
    }
  }, []);

  const moveToNextPlayer = (playerId) => {
    socket.emit("check_for_next_turn", {
      playerId,
      teamId,
      round,
      batchSize,
      totalSize,
    });
  };

  const startNewRound = (nextRound) => {
    if (completedDots >= 4) {
      socket.emit("check_for_new_round", { round, nextRound, teamId });
    }
  };

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
      setFetchedPlayersTime(true);
    }
  };

  const handleTeamTime = (seconds, miliSeconds, isFirstValue) => {
    if (isFirstValue) {
      playersTime[round]["first"] = `${seconds}.${miliSeconds}`;
    } else if (seconds !== 0 && miliSeconds !== 0) {
      playersTime[round]["total"] = `${seconds}.${miliSeconds}`;
    }
    setFetchedPlayersTime(true);
  };

  const generateDot = (dotIndex, playerId, clickedDots) => {
    return (
      <Dot
        dotIndex={dotIndex}
        teamId={teamId}
        roomId={roomId}
        playerId={playerId}
        round={round}
        socket={socket}
        clickedDots={clickedDots}
        batchSize={batchSize}
        totalSize={totalSize}
      />
    );
  };

  return (
    <div className="container flex flex-row flex-wrap justify-center gap-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-6 w-full md:w-[85%] lg:w-[70%] xl:w-[50%] 2xl:w-[55%] my-5">
        {players && players.length > 0
          ? players.map((p, index) => {
              let loopArray;
              if (p.endIndex - p.startIndex >= 0) {
                loopArray = new Array(p.endIndex - p.startIndex).fill(null);
              }
              return (
                <div
                  key={index}
                  className={clsx(
                    "flex flex-col bg-white border-2 rounded-md p-2 mx-3 min-h-[200px]",
                    {
                      "pointer-events-none": p.name !== playerName,
                    },
                  )}
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                  }}
                >
                  <div className="flex gap-x-2 items-center justify-between">
                    <div className="flex items-center bg-gray-200 text-gray-700 rounded-md whitespace-nowrap text-center leading-none p-2">
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
                    className={clsx(
                      "flex items-center flex-wrap w-100 my-auto",
                      {
                        visible: p.isCurrentPlayer,
                        invisible: !p.isCurrentPlayer,
                      },
                    )}
                  >
                    {loopArray.map((item, loopIndex) => {
                      const index = loopIndex + p.startIndex;
                      return (
                        <div key={index} className="m-2">
                          {generateDot(index, p.id, clickedDots)}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => moveToNextPlayer(p.id)}
                    disabled={!isNextTurnEnabled}
                    className={clsx(
                      "flex items-center justify-center w-full bg-green-500 border-b-0 border-green-700 sm:w-auto rounded-md px-4 py-2 text-white disabled:opacity-50",
                      {
                        visible: p.name === playerName,
                        hidden: p.name !== playerName,
                      },
                    )}
                  >
                    {NEXT_BTN_TEXT}
                  </button>
                </div>
              );
            })
          : ""}
        <div className="flex flex-col bg-white ring-2 ring-green-300 rounded-md p-2 mx-3 min-h-[200px]">
          <div className="flex items-center justify-center font-bold text-md text-gray-700 whitespace-nowrap p-2">
            Customer
          </div>
          <div className={clsx("flex items-center flex-wrap w-100 my-3", {})}>
            {completedDots > 0 &&
              Array.from({ length: completedDots }).map((_, index) => (
                <div
                  key={index}
                  className={`h-12 w-12 mr-2 bg-gray-300 rounded-full cursor-none`}
                ></div>
              ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 w-full md:w-[85%] lg:w-[70%] xl:w-[35%] 2xl:w-[40%] my-5">
        <div className="flex justify-around gap-2 mx-3">
          <PlayerTimer handlePlayerTime={handlePlayerTime} socket={socket} />
          <TeamTimer handleTeamTime={handleTeamTime} socket={socket} />
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
                        <th className={TdStyle.ThStyle}>Round1</th>
                        <th className={TdStyle.ThStyle}>
                          <button
                            disabled={"round1" !== round || !isFaciliator}
                            onClick={() => startNewRound("round2")}
                          >
                            Round2
                          </button>
                        </th>
                        <th className={TdStyle.ThStyle}>
                          <button
                            disabled={"round2" !== round || !isFaciliator}
                            onClick={() => startNewRound("round3")}
                          >
                            Round3
                          </button>
                        </th>
                        <th className={TdStyle.ThStyle}>
                          <button
                            disabled={"round3" !== round || !isFaciliator}
                            onClick={() => startNewRound("round4")}
                          >
                            Round4
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.length > 0 &&
                        Object.keys(playersTime).length !== 0 &&
                        players.map((p) => {
                          return (
                            <tr key={p.id}>
                              <td className={TdStyle.TdStyle}>{p.name}</td>
                              {playersTime[p.name] &&
                                Object.entries(playersTime[p.name]).map(
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
                      <tr>
                        <td className={TdStyle.TdStyle}>First Value</td>
                        <td className={TdStyle.TdStyle2}>
                          {playersTime["round1"]["first"]}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                          {playersTime["round2"]["first"]}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                          {playersTime["round3"]["first"]}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                          {playersTime["round4"]["first"]}
                        </td>
                      </tr>
                      <tr>
                        <td className={TdStyle.TdStyle}>Total</td>
                        <td className={TdStyle.TdStyle2}>
                          {playersTime["round1"]["total"]}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                          {playersTime["round2"]["total"]}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                          {playersTime["round3"]["total"]}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                          {playersTime["round4"]["total"]}
                        </td>
                      </tr>
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
