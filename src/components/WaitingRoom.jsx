import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useAsyncError, useLocation } from "react-router-dom";

const socket = io.connect("http://localhost:5000");

function WaitingRoom() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramValue = searchParams.get("f");
  const [playerName, setPlayerName] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);

  const createRoom = () => {};

  const handleStartGame = (e) => {
    e.preventDefault();
  };
  const sendMessage = () => {
    if (playerName && playerName.length) {
      setPlayerName("");
      socket.emit("send_message", { playerName });
      setRegisteredName(playerName);
    }
  };

  useEffect(() => {
    socket.emit("get_data");
    socket.on("send_data", (data) => {
      setReceivedMessages(data);
    });
    const player = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("randomRoom1234"));
    if (player) {
      setRegisteredName(player.replace("randomRoom1234", ""));
    }
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setReceivedMessages((prevMessages) => [...prevMessages, data.playerName]);
    });

    socket.on("setCookie", ({ key, value }) => {
      document.cookie = `${key}=${value}`;
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  return (
    <>
      {!registeredName && (
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
            onClick={sendMessage}
          >
            Submit
          </button>
        </div>
      )}
      <div className="m-auto">
        <div className="m-auto my-[50px] w-[450px] p-2 gap-2 flex flex-col rounded-sm bg-gray-200 drop-shadow-md">
          <h1 className="text-2xl font-bold">Waiting for players to join</h1>
          <h2>
            You need at least 3 players to run the game. Once the game has
            started you cannot add more players so please ensure all players are
            listed below before starting the game.
          </h2>
          {paramValue === "me" && (
            <button
              onClick={handleStartGame}
              type="button"
              class="focus:outline-none w-[50%] text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 "
            >
              Start Game
            </button>
          )}

          <div className="flex flex-col text-lg gap-1 ">
            {receivedMessages.length
              ? receivedMessages.map((msg, index) => (
                  <div
                    key={index}
                    className="drop-shadow-md px-2 py-1 bg-[white] rounded-sm"
                  >
                    {msg}
                  </div>
                ))
              : ""}
          </div>
        </div>
      </div>
    </>
  );
}

export default WaitingRoom;
