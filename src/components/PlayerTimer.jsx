import { useEffect, useState } from "react";

const PlayerTimer = ({ socket, handlePlayerTime }) => {
  const [seconds, setSeconds] = useState(0);
  const [miliSeconds, setMiliSeconds] = useState(0);
  const [startTimer, setStartTimer] = useState(false);

  useEffect(() => {
    socket.on("manage_player_timer", ({ start, isReset }) => {
      if (isReset) {
        setSeconds(0);
        setMiliSeconds(0);
      }
      setStartTimer(start);
      if (!start) {
        handlePlayerTime(seconds, miliSeconds);
      }
    });
    return () => {
      socket.off("manage_player_timer");
    };
  }, [socket, miliSeconds, seconds]);

  useEffect(() => {
    let secondInterval;
    let miliSecondInterval;

    if (startTimer) {
      secondInterval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);

      miliSecondInterval = setInterval(() => {
        setMiliSeconds((prevMiliSeconds) => {
          if (prevMiliSeconds >= 100) {
            return 0;
          } else {
            return prevMiliSeconds + 1;
          }
        });
      }, 20);
    } else {
      clearInterval(secondInterval);
      clearInterval(miliSecondInterval);
    }

    return () => {
      clearInterval(secondInterval);
      clearInterval(miliSecondInterval);
    };
  }, [startTimer]);

  return (
    <div className="p-2">
      <div className="flex flex-col items-center justify-start gap-1 sm:gap-4">
        <span className="text-gray-800 font-semibold">Your Timer</span>
        <div className="relative flex justify-center gap-1 sm:gap-4">
          <div className="w-14 h-12 flex justify-center items-center bg-gradient-to-tr from-gray-900 to-gray-800 rounded-lg">
            <span className="text-2xl font-semibold text-white">{seconds}</span>
          </div>
          <div className="w-14 h-12 flex justify-center items-center bg-gradient-to-tr from-gray-900 to-gray-800 rounded-lg">
            <span className="text-2xl font-semibold text-white">
              {miliSeconds}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlayerTimer;
