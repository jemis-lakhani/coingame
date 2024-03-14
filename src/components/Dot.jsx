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
}) => {
  const [clicked, setClicked] = useState(false);
  const [isAnyDotClicked, setDotClicked] = useState(false);

  useEffect(() => {
    const data = clickedDots.find((obj) => obj.playerId === playerId);
    if (data !== null && data !== undefined) {
      if (data["clicked_dots"][round].includes(dotIndex)) {
        console.log("selected Index >>> ", dotIndex);
        setClicked(true);
      } else {
        setClicked(false);
      }
    }
  }, [round, clickedDots, dotIndex, playerId]);

  useEffect(() => {
    socket.on("dot_clicked_update", ({ teamData, playerId }) => {
      const player = teamData.find((obj) => obj.playerId === playerId);
      const clickedDots = player["clicked_dots"][round];
      console.log("dot_clicked_update >>> ", { clickedDots }, { dotIndex });
      if (clickedDots.includes(dotIndex)) {
        setClicked(true);
      } else {
        setClicked(false);
      }
    });
  }, [socket, dotIndex]);

  const handleClick = () => {
    console.log("dot clicked >>> ", dotIndex);
    socket.emit("dot_clicked", {
      playerId,
      teamId,
      roomId,
      dotIndex,
      round,
      batchSize,
    });
    if (!isAnyDotClicked) {
      setDotClicked(true);
      socket.emit("start_team_timer", { roomId, teamId });
    }
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
