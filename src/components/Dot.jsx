import React, { useEffect, useState } from "react";

const Dot = ({
  playerId,
  dotIndex,
  teamId,
  roomId,
  round,
  socket,
  clickedDot,
  batchSize,
  handlePlayerTimer,
}) => {
  const [clicked, setClicked] = useState(false);
  const [isAnyDotClicked, setDotClicked] = useState(false);

  useEffect(() => {
    const data = clickedDot.find((obj) => obj.id === playerId);
    if (data !== null && data !== undefined) {
      if (data["clicked_dots"][round].includes(dotIndex)) {
        setClicked(true);
      }
    }
  }, []);

  useEffect(() => {
    socket.on("dot_clicked_update", (data) => {
      if (data.playerId === playerId && data.dots.includes(dotIndex)) {
        setClicked(true);
        if (data.dots.length >= batchSize) {
          handlePlayerTimer(socket.id, false);
        }
      }
    });
  }, [socket]);

  const handleClick = () => {
    socket.emit("dot_clicked", {
      playerId,
      teamId,
      roomId,
      dotIndex,
      round,
    });
    if (!isAnyDotClicked) {
      setDotClicked(true);
      socket.emit("start_team_timer", { roomId, teamId });
      handlePlayerTimer(socket.id, true);
    }
  };

  return (
    <div
      key={dotIndex}
      className={`h-12 w-12 ${
        clicked ? "bg-gray-800 pointer-events-none" : "bg-gray-300"
      } rounded-full cursor-pointer`}
      onClick={handleClick}
    ></div>
  );
};

export default Dot;
