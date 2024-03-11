import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

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
  const [playerName, setPlayerName] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [players, setPlayers] = useState([]);
  const [playersPerTeam, setPlayersPerTeam] = useState(0);
  const [isRoomCreated, setRoomCreated] = useState(false);

  const startGame = (e) => {
    e.preventDefault();
    if (playersPerTeam > 0 && playersPerTeam <= players.length) {
      const roomId = generateRandomId();
      const data = { roomId, teamSize: playersPerTeam };
      socket.emit("start_game", data);
      return () => {
        socket.off("start_game");
      };
    }
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
        const url = `/gameboard?roomId=${roomId}&teamId=${teamId}`;
        window.location.href = url;
      }
    });

    const player = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("randomRoom1234"));
    if (player) {
      setRegisteredName(player.replace("randomRoom1234", ""));
    }

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

    return () => {
      socket.off("setCookie");
      socket.off("update_player_list");
    };
  }, [socket]);

  return (
    <>
      {!isRoomCreated && !registeredName && (
        <div
          className="flex flex-col gap-6 m-auto py-8 mt-[50px] w-[450px] p-2 rounded-md bg-gray-100"
          style={{
            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          }}
        >
          <h1 className="text-2xl font-bold">
            Enter your name to join the game
          </h1>
          <input
            value={playerName}
            placeholder="Your name"
            onChange={(e) => setPlayerName(e.target.value)}
            className="px-3 py-2"
          />
          <button
            className="flex items-center justify-center w-full bg-green-500 sm:w-auto rounded-sm px-4 py-2 text-white disabled:opacity-50"
            onClick={addPlayer}
          >
            Join
          </button>
        </div>
      )}
      <div
        className="m-auto"
        style={{
          boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
        }}
      >
        {!isRoomCreated ? (
          <>
            <div className="m-auto w-[450px] p-2 gap-3 flex flex-col rounded-sm bg-gray-200 drop-shadow-md">
              <h1 className="text-2xl font-bold">
                Waiting for players to join
              </h1>
              <h2>
                Once the game has started you cannot add more players so please
                ensure all players are listed below before starting the game.
              </h2>
              {paramValue === "me" && (
                <>
                  <input
                    value={playersPerTeam === 0 ? "" : playersPerTeam}
                    placeholder="Enter players per team"
                    onChange={(e) => setPlayersPerTeam(e.target.value)}
                    className="px-3 py-2"
                  />
                  <button
                    onClick={startGame}
                    type="button"
                    className="focus:outline-none w-[50%] text-white bg-green-500 hover:bg-green-800 focus:ring-0 font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 "
                  >
                    Start Game
                  </button>
                </>
              )}

              <div className="flex flex-col text-lg">
                {players.length
                  ? players.map((player, index) => (
                      <div
                        key={index}
                        className="drop-shadow-md px-2 py-1 bg-[white]"
                      >
                        {player.name}
                      </div>
                    ))
                  : ""}
              </div>
            </div>
          </>
        ) : (
          ""
        )}
      </div>
    </>
  );
}

export default WaitingRoom;
