import React from "react";

function Home() {
  const handleParticipant = (e) => {
    e.preventDefault();
    window.location.href = `${window.location.origin}/waiting-room`;
  };
  const handleFacilitator = (e) => {
    e.preventDefault();
    window.location.href = `${window.location.origin}/waiting-room?f=me`;
  };

  return (
    <div className="h-full flex items-center">
      <div className="mx-auto w-[450px]">
        <button
          onClick={handleParticipant}
          type="button"
          class="focus:outline-none w-full text-white bg-[#3498db] hover:bg-[#1c6ea4] font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 "
        >
          For Participants
        </button>
        <button
          onClick={handleFacilitator}
          type="button"
          class="focus:outline-none w-full text-white bg-[#ff7f50] hover:bg-[#d4552b] font-medium rounded-sm text-sm px-5 py-2.5 me-2 mb-2 "
        >
          For Facilitator
        </button>
      </div>
    </div>
  );
}

export default Home;
