import React, { useState } from "react";

const Instruction = () => {
  const [rounds, setRounds] = useState([
    {
      name: "General Instructions",
      isOpen: false,
      content:
        "The black circles on the left represent virtual coins. If you click a black coin it will turn white. If you click a white coin it will turn black. This is to emulate the flipping of a coin. Please await instructions from your facilitator before clicking any coins!",
    },
    {
      name: "Batch size of 20 (Round 1)",
      isOpen: false,
      content:
        "Flip all 20 coins BEFORE you move them to the next player.To move the coins to the next player, click the 'Move batch to next player' button.",
    },
    {
      name: "Batch size of 5 (Round 2)",
      isOpen: false,
      content:
        "Flip 5 coins over.When you have turned 5 coins, the 'Move batch to next player' button is enabled. If you have 5 coins ready to be flipped, then you can start flipping them.",
    },
    {
      name: "Batch size of X (Round 3 & Round 4)",
      isOpen: false,
      content:
        "Starting with worker #1, each worker will process 20 coins in batch of X(Defined by the first player of the team)",
    },
  ]);

  const toggleRound = (index) => {
    setRounds(
      rounds.map((round, i) =>
        i === index ? { ...round, isOpen: !round.isOpen } : round,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-1 mx-4 overflow-hidden w-full">
      {rounds.map((round, index) => (
        <div key={index} className="relative w-full">
          <h6 className="mb-0">
            <button
              className="relative flex items-center justify-between w-full py-4 font-semibold text-left transition-all ease-in border-solid cursor-pointer text-gray-800"
              onClick={() => toggleRound(index)}
            >
              <span>{round.name}</span>
              <img
                src={round.isOpen ? "../../../minus.svg" : "../../../plus.svg"}
                className="h-4 w-4"
              />
            </button>
          </h6>
          <div
            className={`grid overflow-hidden transition-all duration-200 ease-in-out ${
              round.isOpen
                ? "grid-rows-[1fr] opacity-100 pb-4"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden text-sm leading-normal text-gray-500">
              {round.content}
            </div>
          </div>
          <hr className="border-gray-300" />
        </div>
      ))}
    </div>
  );
};

export default Instruction;
