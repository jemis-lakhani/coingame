import { useEffect, useState } from "react";

const TeamTimer = ({ socket, handleTeamTime }) => {
  const [seconds, setSeconds] = useState(0);
  const [miliSeconds, setMiliSeconds] = useState(0);
  const [startTimer, setStartTimer] = useState(false);
  const [isFirstValue, setFirstValue] = useState(false);

  useEffect(() => {
    socket.on("manage_team_timer", ({ start, isFirstValue, isReset }) => {
      if (isReset) {
        setSeconds(0);
        setMiliSeconds(0);
      }
      setStartTimer(start);
      setFirstValue(isFirstValue);
      if (!start) {
        handleTeamTime(seconds, miliSeconds, isFirstValue);
      }
    });
    return () => {
      socket.off("manage_team_timer");
    };
  }, [socket, seconds, miliSeconds]);

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

  useEffect(() => {
    if (isFirstValue) {
      handleTeamTime(seconds, miliSeconds, isFirstValue);
      setFirstValue(false);
    }
  }, [isFirstValue]);

  return (
    <div className="p-2">
      <div className="flex flex-col items-center justify-start gap-1 sm:gap-4">
        <span className="text-gray-800 font-semibold">Team Timer</span>
        <div className="flex gap-1 sm:gap-4">
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
export default TeamTimer;
