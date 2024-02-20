import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

const socket = io.connect("http://localhost:5000");

function generateRandomId() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
    const roomId = generateRandomId();
    if (
      playersPerTeam > 0 &&
      players.length > 0 &&
      players.length % playersPerTeam === 0
    ) {
      const data = { players, roomId, teamSize: playersPerTeam };
      socket.emit("join_room", data);
    }

    return () => {
      socket.off("join_room");
    };
  };

  const addPlayer = () => {
    if (playerName && playerName.length) {
      setPlayerName("");
      const data = { socketId: socket.id, name: playerName };
      socket.emit("add_player", data);
      socket.on("waiting", (data) => {
        // console.log({ data });
      });
      setRegisteredName(playerName);

      return () => {
        socket.off("add_player");
      };
    }
  };

  const addQueryParam = (key, value) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set(key, value);
    const newUrl = `${location.pathname}?${searchParams.toString()}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  useEffect(() => {
    socket.emit("get_data");
    socket.on("send_data", (data) => {
      setPlayers(data);
    });
    const player = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("randomRoom1234"));
    if (player) {
      setRegisteredName(player.replace("randomRoom1234", ""));
    }

    return () => {
      socket.off("send_data");
    };
  }, []);

  useEffect(() => {
    socket.on("update_player_list", (data) => {
      setPlayers((prevMessages) => [...prevMessages, data]);
    });

    socket.on("room_users", ({ roomId, socketId, teamId }) => {
      if (socketId === socket.id) {
        addQueryParam("room", roomId);
        setRoomCreated(true);
        const url = `/gameboard?roomId=${roomId}&teamId=${teamId}`;
        window.location.href = url;
      }
    });

    socket.on("setCookie", ({ key, value }) => {
      document.cookie = `${key}=${value}`;
    });

    return () => {
      socket.off("receive_message");
      socket.off("room_users");
      socket.off("update_player_list");
    };
  }, [socket]);

  return (
    <>
      {!isRoomCreated && !registeredName && (
        <div className="flex flex-col m-auto py-8 mt-[50px] w-[450px] p-2 gap-6 rounded-sm bg-gray-200 drop-shadow-md">
          <h1 className="text-2xl font-bold">
            Enter your name to join the game
          </h1>
          <input
            value={playerName}
            placeholder="Enter message"
            onChange={(e) => setPlayerName(e.target.value)}
            className="px-3 py-2"
          />
          <button
            className="inline-block p-2 bg-green-600 text-white rounded-md"
            onClick={addPlayer}
          >
            Submit
          </button>
        </div>
      )}
      <div className="m-auto">
        {!isRoomCreated ? (
          <>
            <div className="m-auto w-[450px] p-2 gap-2 flex flex-col rounded-sm bg-gray-200 drop-shadow-md">
              <h1 className="text-2xl font-bold">
                Waiting for players to join
              </h1>
              <h2>
                You need at least 4 players to run the game. Once the game has
                started you cannot add more players so please ensure all players
                are listed below before starting the game.
              </h2>
              {paramValue === "me" && (
                <>
                  <input
                    value={playersPerTeam == 0 ? "" : playersPerTeam}
                    placeholder="Enter players per team"
                    onChange={(e) => setPlayersPerTeam(e.target.value)}
                    className="px-3 py-2"
                  />
                  <button
                    onClick={startGame}
                    type="button"
                    className="focus:outline-none w-[50%] text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 "
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
