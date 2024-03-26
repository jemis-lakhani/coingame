import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import FaciliatorInstruction from "./FaciliatorInstruction";

function generateRandomId() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUserId() {
  const length = 8;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let userId = "";
  for (let i = 0; i < length; i++) {
    userId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return userId;
}

const socket = io.connect("http://localhost:5000");
const SOCKET_STORAGE_KEY = "socketConnection";

function WaitingRoom() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramValue = searchParams.get("f");
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [players, setPlayers] = useState([]);
  const [playersPerTeam, setPlayersPerTeam] = useState(0);
  const [isRoomCreated, setRoomCreated] = useState(false);
  const [isFacilitator, setFacilitator] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    setFacilitator(paramValue === "me");
  }, [paramValue]);

  useEffect(() => {
    socket.emit("fetch_waiting_room_players");
    socket.on("set_waiting_room_players", (data) => {
      setPlayers(data);
    });

    socket.on("update_socket_connection", (data) => {
      const oldSocketId = JSON.parse(localStorage.getItem(SOCKET_STORAGE_KEY));
      if (oldSocketId === null) {
        localStorage.setItem(
          SOCKET_STORAGE_KEY,
          JSON.stringify({ id: socket.id }),
        );
        return;
      }
      if (socket.id !== oldSocketId.id) {
        localStorage.setItem(
          SOCKET_STORAGE_KEY,
          JSON.stringify({ id: socket.id }),
        );
        socket.emit("update_socket_connection", {
          oldId: oldSocketId.id,
          newId: socket.id,
        });
      }
    });

    socket.on("join_room", ({ id, roomId, socketId, teamId }) => {
      if (socketId === socket.id) {
        setRoomCreated(true);
        let url = "";
        if (paramValue === "me") {
          url = `/gameboard?f=me&roomId=${roomId}&teamId=${teamId}`;
        } else {
          url = `/gameboard?&roomId=${roomId}&teamId=${teamId}`;
        }
        window.location.href = url;
      }
    });

    const player = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("randomRoom1234"));
    if (player) {
      setRegisteredName(player.replace("randomRoom1234", ""));
    }

    deleteCookie("randomRoom1234");

    return () => {
      socket.off("join_room");
      socket.off("update_socket_connection");
      socket.off("set_waiting_room_players");
    };
  }, []);

  useEffect(() => {
    socket.on("update_player_list", (data) => {
      setPlayers((prevMessages) => [...prevMessages, data]);
    });

    socket.on("setCookie", ({ key, value }) => {
      document.cookie = `${key}=${value}`;
    });

    socket.on("game_started", () => {
      setGameStarted(true);
    });

    return () => {
      socket.off("setCookie");
      socket.off("update_player_list");
    };
  }, [socket]);

  const startGame = (e) => {
    e.preventDefault();
    if (playersPerTeam > 0 && playersPerTeam <= players.length) {
      const roomId = generateRandomId();
      setRoomId(roomId);
      const data = { roomId, teamSize: playersPerTeam };
      socket.emit("start_game", data);
      return () => {
        socket.off("start_game");
      };
    }
  };

  const resetGame = (e) => {
    e.preventDefault();
    socket.emit("reset_game", { roomId });
  };

  const addPlayer = () => {
    if (playerName && playerName.length) {
      setPlayerName("");
      const data = {
        id: generateUserId(),
        socketId: socket.id,
        name: playerName,
        isRoomCreated: false,
      };
      socket.emit("add_player_to_team", data);
      setRegisteredName(playerName);

      return () => {
        socket.off("add_player_to_team");
      };
    }
  };

  function deleteCookie(cookieName) {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  return (
    <>
      {!isRoomCreated && !registeredName && !isFacilitator && (
        <div className="flex flex-col gap-6 p-6 w-[90%] mx-auto md:w-[450px] rounded-xl border shadow bg-white">
          <h3 className="text-xl font-semibold leading-none tracking-tight">
            Enter your name
          </h3>
          <input
            value={playerName}
            placeholder="Your name"
            onChange={(e) => setPlayerName(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            className="flex items-center justify-center w-full h-9 font-medium transition-colors bg-green-500 sm:w-auto rounded-md px-4 py-2 text-white disabled:opacity-50"
            onClick={addPlayer}
          >
            Join
          </button>
        </div>
      )}

      {!isRoomCreated && (
        <>
          <div className="w-[90%] mx-auto md:w-[450px] p-6 flex flex-col gap-3 rounded-xl border shadow bg-white">
            <h3 className="text-xl font-semibold leading-none tracking-tight">
              Players in room
            </h3>
            <p className="text-sm text-gray-500 text-muted-foreground">
              Once the game has started you cannot add more players so please
              ensure all players are listed above before starting the game.
            </p>

            <div className="flex flex-row flex-wrap gap-3">
              {players.length > 0 ? (
                players.map((player, index) => (
                  <div
                    key={index}
                    className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-gradient-to-tr from-gray-900 to-gray-800 py-1.5 px-3 font-sans text-sm font-bold text-white"
                  >
                    {player.name}
                  </div>
                ))
              ) : (
                <span className="flex justify-center bg-gray-900/10 text-gray-900 font-medium py-1.5 px-3 select-none whitespace-nowrap rounded w-full">
                  Waiting for players to join
                </span>
              )}
            </div>

            {isFacilitator && (
              <>
                {isGameStarted ? (
                  <button
                    onClick={(e) => resetGame(e)}
                    type="button"
                    className="flex items-center justify-center w-full h-9 font-medium transition-colors bg-red-500 sm:w-auto rounded-md px-4 py-2 text-white"
                  >
                    Reset Game
                  </button>
                ) : (
                  <>
                    <input
                      type="number"
                      value={playersPerTeam === 0 ? "" : playersPerTeam}
                      placeholder="Enter players per team"
                      onChange={(e) => setPlayersPerTeam(e.target.value)}
                      className="flex h-9 w-full mt-5 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-inner transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-80"
                      disabled={!(players.length > 0)}
                    />
                    <button
                      onClick={(e) => startGame(e)}
                      type="button"
                      className="flex items-center justify-center w-full h-9 font-medium transition-colors bg-green-500 sm:w-auto rounded-md px-4 py-2 text-white disabled:opacity-60"
                      disabled={!(players.length > 0)}
                    >
                      Start Game
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}

      {isFacilitator && (
        <div className="flex w-[90%] mx-auto md:w-[450px]">
          <FaciliatorInstruction />
        </div>
      )}
    </>
  );
}

export default WaitingRoom;
