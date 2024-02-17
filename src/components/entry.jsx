import React from "react";

function Entry() {
  const handleParticipant = (e) => {
    e.preventDefault();
  };
  const handleFacilitator = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <div className="m-auto w-[450px] mt-[10%]">
        <button
          onClick={handleParticipant}
          type="button"
          class="focus:outline-none w-full text-white bg-[#3498db] hover:bg-[#1c6ea4] focus:ring-4 focus:ring-green-300 font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 "
        >
          For Participants
        </button>
        <button
          onClick={handleFacilitator}
          type="button"
          class="focus:outline-none w-full text-white bg-[#ff7f50] hover:bg-[#d4552b] focus:ring-4 focus:ring-green-300 font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 "
        >
          For Facilitator
        </button>
      </div>
    </div>
  );
}

export default Entry;
