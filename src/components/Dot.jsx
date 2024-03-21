import React, { useEffect, useState } from "react";

const Dot = ({
  playerId,
  dotIndex,
  teamId,
  roomId,
  round,
  socket,
  clickedDots,
  batchSize,
  totalSize,
}) => {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const data = clickedDots.find((obj) => obj.playerId === playerId);
    if (data !== null && data !== undefined) {
      if (data["clicked_dots"][round].includes(dotIndex)) {
        setClicked(true);
      } else {
        setClicked(false);
      }
    }
  }, [round, clickedDots, dotIndex, playerId]);

  useEffect(() => {
    socket.on("dot_clicked_update", ({ teamData }) => {
      const player = teamData.find((obj) => obj.playerId === playerId);
      const clickedDots = player["clicked_dots"][round];
      if (clickedDots.includes(dotIndex)) {
        setClicked(true);
      } else {
        setClicked(false);
      }
    });
  }, [socket, round, dotIndex, playerId]);

  const handleClick = () => {
    socket.emit("dot_clicked", {
      playerId,
      teamId,
      dotIndex,
      round,
      batchSize,
      totalSize,
    });
  };

  return (
    <div
      key={dotIndex + teamId + roomId + playerId}
      className={`h-12 w-12 ${
        clicked ? "bg-gray-800 pointer-events-none" : "bg-gray-300"
      } rounded-full cursor-pointer`}
      onClick={() => handleClick()}
    ></div>
  );
};

export default Dot;
