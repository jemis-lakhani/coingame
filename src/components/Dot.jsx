import React, { useEffect, useState } from "react";

const Dot = ({
  playerId,
  dotIndex,
  teamId,
  roomId,
  socket,
  clickedDot,
  batchSize,
}) => {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const data = clickedDot.find((obj) => obj.id === playerId);
    if (data !== null && data !== undefined) {
      if (data["clicked_dots"]["round1"].includes(dotIndex)) {
        setClicked(true);
      }
    }
  }, []);

  const handleClick = () => {
    socket.emit("dot_clicked", {
      playerId,
      teamId,
      roomId,
      dotIndex,
      round: "round1",
    });
  };

  useEffect(() => {
    socket.on("dot_clicked_update", (data) => {
      if (data.playerId === playerId && data.dots.includes(dotIndex)) {
        setClicked(true);
      }
    });
  }, []);

  return (
    <div
      key={dotIndex}
      className={`h-12 w-12 ${
        clicked ? "bg-white pointer-events-none" : "bg-black"
      } rounded-full cursor-pointer`}
      onClick={handleClick}
    ></div>
  );
};

export default Dot;
