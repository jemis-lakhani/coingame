import React, { useEffect, useState } from "react";
import Dot from "./Dot";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import TeamTimer from "./TeamTimer";
import PlayerTimer from "./PlayerTimer";
import { Icons } from "./Icons";
import { BATCH_SIZE, NEXT_ROUND } from "../context/Constants";
import Instruction from "./Instruction";

const TdStyle = {
  ThStyle: `truncate text-dark w-1/6 min-w-[100px] bg-gradient-to-tr from-gray-900 to-gray-800 border-transparent p-3 text-lg text-white font-medium `,
  TdStyle: `truncate text-dark border-l border-gray-300 bg-gray-200 p-3 text-center text-base font-medium`,
  TdStyle2: `truncate text-dark border-b border-l border-r border-[#E8E8E8] bg-white p-3 text-center text-base font-medium`,
};

const socket = io.connect(process.env.REACT_APP_BACKEND_URL);

const GameBoard = () => {
  // Params
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const teamId = searchParams.get("teamId");
  const roomId = searchParams.get("roomId");
  // Players/Game stats
  const totalSize = 20;
  const [players, setPlayers] = useState([]);
  const [clickedDots, setClickedDots] = useState({});
  const [playerName, setPlayerName] = useState();
  const [batchSize, setBatchSize] = useState(20);
  const [newBatchSize, setNewBatchSize] = useState();
  const [round, setRound] = useState("round1");
  const [isFirstPlayer, setFirstPlayer] = useState(false);
  const [playersTime, setPlayersTime] = useState({
    round1: { first: "", total: "" },
    round2: { first: "", total: "" },
    round3: { first: "", total: "" },
    round4: { first: "", total: "" },
  });
  const [isNextTurnEnabled, setNextTurnEnabled] = useState(false);
  const [completedDots, setCompletedDots] = useState(0);
  const [isFetchedPlayersTime, setFetchedPlayersTime] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState("");

  // Fetch team players
  useEffect(() => {
    const player = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("randomRoom1234"));
    if (player) {
      setPlayerName(player.replace("randomRoom1234=", ""));
    }
    if (socket) {
      socket.emit("fetch_team_players", { teamId, roomId });
    }
  }, []);

  // Set Team Players
  useEffect(() => {
    socket.on("restart_game", () => {
      window.location.reload();
    });

    socket.on(
      "team_players",
      ({ roomId: rId, teamId: tId, players, clickedDots }) => {
        if (
          parseInt(roomId) === parseInt(rId) &&
          parseInt(teamId) === parseInt(tId)
        ) {
          const time = playersTime;
          let isFirstPlayer = false;
          players.forEach((p) => {
            time[p.name] = {
              round1: "",
              round2: "",
              round3: "",
              round4: "",
            };
            if (playerName === p.name) {
              setFirstPlayer(p.isFirstPlayer);
              isFirstPlayer = p.isFirstPlayer;
            }
          });
          setPlayers(players);
          setClickedDots(clickedDots);
          if (isFirstPlayer) {
            const data = { playersTime: time, teamId };
            socket.emit("fetch_players_time", data);
          }
        }
      },
    );

    return () => {
      socket.off("team_players");
    };
  }, [socket, playerName]);

  useEffect(() => {
    if (socket) {
      socket.on(
        "next_player_turn",
        ({ teamPlayers, clickedDots, roundCompleted, isLastPlayer }) => {
          setPlayers(teamPlayers);
          setClickedDots(clickedDots);
          if (roundCompleted) {
            setCompletedDots(totalSize);
          } else if (isLastPlayer) {
            const dots = Math.min(completedDots + batchSize, totalSize);
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
    socket.on(
      "start_new_round",
      ({ players, clickedDots, nextRound, batchSize }) => {
        setRound(nextRound);
        setClickedDots(clickedDots);
        setPlayers(players);
        setBatchSize(batchSize);
        setCompletedDots(0);
        setNextTurnEnabled(false);
      },
    );
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

  const moveToNextPlayer = (playerId) => {
    socket.emit("check_for_next_turn", {
      playerId,
      teamId,
      round,
      batchSize,
      totalSize,
    });
  };

  const startNewRound = () => {
    const nextRound = NEXT_ROUND[round];
    const newSize = parseInt(newBatchSize);
    if (nextRound === "round3" || nextRound === "round4") {
      if (newSize > 0 && newSize <= totalSize && totalSize % newSize === 0) {
        setModalError("");
        setShowModal(false);
        if (completedDots >= totalSize) {
          socket.emit("check_for_new_round", {
            round,
            nextRound,
            teamId,
            batchSize: newSize,
          });
        }
      } else {
        setModalError("Please enter valid batch size");
      }
    } else if (completedDots >= totalSize) {
      socket.emit("check_for_new_round", {
        round,
        nextRound,
        teamId,
        batchSize: BATCH_SIZE[nextRound],
      });
    }
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

  const generateDot = (index, dotIndex, playerId, clickedDots) => {
    return (
      <Dot
        playerIndex={index}
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
    <>
      <div className="container flex flex-row flex-wrap justify-center gap-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-6 w-full md:w-[85%] lg:w-[70%] xl:w-[50%] 2xl:w-[55%] my-5">
          <div className="relative grid select-none items-center whitespace-nowrap uppercase rounded-lg bg-gradient-to-tr from-gray-900 to-gray-800 py-1.5 px-3 font-sans text-sm font-bold text-white mx-auto">
            {round}
          </div>
          {players && players.length > 0
            ? players.map((p, index) => {
                let loopArray;
                if (p.endIndex - p.startIndex >= 0) {
                  loopArray = new Array(p.endIndex - p.startIndex).fill(null);
                }
                const selfPlayer = p.name === playerName;
                return (
                  <div
                    key={index}
                    className={clsx(
                      "flex flex-col gap-2 rounded-md border shadow-md bg-white p-2 mx-3 min-h-[200px]",
                      {
                        "pointer-events-none": !selfPlayer,
                      },
                    )}
                  >
                    <div className="flex gap-x-2 items-center justify-between">
                      <div className="flex items-center bg-gray-200 font-medium rounded-md whitespace-nowrap text-center leading-none p-2">
                        <Icons.user className="mr-2 h-4 w-4" />
                        {p.name}
                        {selfPlayer ? "  (Me)" : ""}
                      </div>
                      {p.count >= totalSize && (
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
                        const dotIndex = loopIndex + p.startIndex;
                        return (
                          <div key={dotIndex} className="m-2">
                            {generateDot(index, dotIndex, p.id, clickedDots)}
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
                          visible: selfPlayer,
                          hidden: !selfPlayer,
                        },
                      )}
                    >
                      Move Turn to Next Player
                    </button>
                  </div>
                );
              })
            : ""}
          <div className="flex flex-col gap-2 bg-white ring-2 ring-gray-700 rounded-md p-2 mx-3 min-h-[200px]">
            <div className="flex items-center">
              <span className="flex bg-gray-200 font-medium rounded-md whitespace-nowrap leading-none p-2">
                <Icons.user className="mr-2 h-4 w-4" />
                Customer
              </span>
              <div className="flex-1"></div>
            </div>
            <div className="flex items-center flex-wrap w-100 my-3">
              {completedDots > 0 &&
                Array.from({ length: completedDots }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-12 w-12 m-2 bg-gray-300 rounded-full`}
                  ></div>
                ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-6 w-full md:w-[85%] lg:w-[70%] xl:w-[45%] 2xl:w-[40%] my-5">
          <div className="flex justify-between w-[80%] lg:w-[66%] gap-2 mx-auto">
            <PlayerTimer handlePlayerTime={handlePlayerTime} socket={socket} />
            <TeamTimer handleTeamTime={handleTeamTime} socket={socket} />
          </div>
          <section className="w-full bg-white mx-3 overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="text-center">
                <tr>
                  <th className={TdStyle.ThStyle}>Player</th>
                  <th className={`${TdStyle.ThStyle} cursor-default`}>
                    Round1
                  </th>
                  <th className={TdStyle.ThStyle}>
                    <button
                      disabled={"round1" !== round || !isFirstPlayer}
                      onClick={() => startNewRound()}
                    >
                      Round2
                    </button>
                  </th>
                  <th className={TdStyle.ThStyle}>
                    <button
                      disabled={"round2" !== round || !isFirstPlayer}
                      onClick={() => {
                        setNewBatchSize(batchSize);
                        setShowModal(true);
                      }}
                    >
                      Round3
                    </button>
                  </th>
                  <th className={TdStyle.ThStyle}>
                    <button
                      disabled={"round3" !== round || !isFirstPlayer}
                      onClick={() => {
                        setNewBatchSize(batchSize);
                        setShowModal(true);
                      }}
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
                        <td className={TdStyle.TdStyle}>
                          {p.name === playerName ? `${p.name} (me)` : p.name}
                        </td>
                        {playersTime[p.name] &&
                          Object.entries(playersTime[p.name]).map(
                            ([key, value], index) => {
                              return (
                                <td key={index} className={TdStyle.TdStyle2}>
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
                  <td className={TdStyle.TdStyle}>Customer</td>
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
          </section>
          <Instruction />
        </div>
      </div>

      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto min-w-[500px] max-w-3xl">
              <div className="border-0 rounded-md shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-center justify-between p-4 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-xl font-semibold">
                    Select the batch size
                  </h3>
                  <button
                    className="flex items-center p-1 ml-auto bg-white border-0 text-black opacity-100 font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <Icons.close className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative p-4">
                  <label className="mb-4">Batch Size</label>
                  <input
                    type="number"
                    className="flex h-9 w-full mt-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-inner transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-80"
                    placeholder="Enter the batch size"
                    onChange={(e) => setNewBatchSize(e.target.value)}
                    defaultValue={BATCH_SIZE[round]}
                  />
                  <p className="mt-2 text-red-500 text-sm">{modalError}</p>
                </div>
                <div className="flex items-center justify-end p-3 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => {
                      startNewRound();
                    }}
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
};

export default GameBoard;
