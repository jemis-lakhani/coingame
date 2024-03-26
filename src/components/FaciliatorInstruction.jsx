import clsx from "clsx";
import React, { useState } from "react";

const FaciliatorInstruction = () => {
  const [isGeneral, setGeneral] = useState(false);
  return (
    <div className="relative w-full mb-2">
      <h6 className="mb-0">
        <button
          className="relative flex items-center justify-between w-full py-4 font-semibold text-left transition-all ease-in border-solid cursor-pointer text-gray-800"
          onClick={() => setGeneral(!isGeneral)}
        >
          <span>Facilitator Only</span>
          <img
            src={isGeneral ? "../../../minus.svg" : "../../../plus.svg"}
            className="h-4 w-4"
          />
        </button>
      </h6>
      <div
        className={clsx(
          "grid overflow-hidden transition-all duration-200 ease-in-out",
          {
            "grid-rows-[1fr] opacity-100 pb-4": isGeneral,
            "grid-rows-[0fr] opacity-0": !isGeneral,
          },
        )}
      >
        <div className="overflow-hidden text-sm leading-normal text-gray-500">
          Each players timer starts automatically when they flip their first
          coin. The customer timer starts automatically when the first player
          flips their first coin. Clicking the results table headings above
          switches the batch size. Clicking the results table headings resets
          the round if it's already running. The customer timer stops when all
          20 coins are delivered to the customer.
        </div>
      </div>
      <hr className="border-gray-300" />
    </div>
  );
};

export default FaciliatorInstruction;
