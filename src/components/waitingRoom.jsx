import React from "react";

function WaitingRoom() {
  const players = ["player1", "player2"];
  const handleStartGame = (e) => {
    e.preventDefault();
  };

  return (
    <div className="">
      <div className="m-auto mt-[50px] w-[450px] p-2 gap-2 flex flex-col rounded-sm bg-[#F8FAFC] drop-shadow-md">
        <h1 className="text-2xl font-bold">Waiting for players to join</h1>
        <h2 className="">
          You need at least 3 players to run the game. Once the game has started
          you cannot add more players so please ensure all players are listed
          below before starting the game.
        </h2>
        <button
          onClick={handleStartGame}
          type="button"
          class="focus:outline-none w-[50%] text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 "
        >
          Start Game
        </button>
        <div className="flex flex-col text-lg gap-1 ">
          {players.map((item) => {
            return (
              <div className="drop-shadow-md px-2 py-1 bg-[white] rounded-sm">
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WaitingRoom;
