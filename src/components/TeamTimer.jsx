import { useEffect, useState } from "react";

const TeamTimer = ({ startTimer }) => {
  const [seconds, setSeconds] = useState(0);
  const [miliSeconds, setMiliSeconds] = useState(0);

  useEffect(() => {
    let secondInterval;
    let miliSecondInterval;

    if (startTimer) {
      secondInterval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);

      miliSecondInterval = setInterval(() => {
        setMiliSeconds((prevSeconds) => {
          if (prevSeconds >= 999) {
            return 0;
          } else {
            return prevSeconds + 1;
          }
        });
      }, 1);
    }

    return () => {
      clearInterval(secondInterval);
      clearInterval(miliSecondInterval);
    };
  }, [startTimer]);

  return (
    <div className="p-2">
      <div className="flex flex-col items-center justify-start gap-1 sm:gap-4">
        <span className="text-black">Team Time</span>
        <div className="flex gap-1 sm:gap-4">
          <div className="flex justify-between items-center h-16 w-16 sm:w-12 sm:h-12 lg:w-16 lg:h-14 bg-gray-800 rounded-lg">
            <div className="relative h-2.5 w-2.5 sm:h-3 sm:w-3 !-left-[6px] rounded-full bg-white"></div>
            <span className="text-2xl font-semibold text-white">{seconds}</span>
            <div className="relative h-2.5 w-2.5 sm:h-3 sm:w-3 -right-[6px] rounded-full bg-white"></div>
          </div>
          <div className="flex justify-between items-center h-16 w-16 sm:w-12 sm:h-12 lg:w-16 lg:h-14 bg-gray-800 rounded-lg">
            <div className="relative h-2.5 w-2.5 sm:h-3 sm:w-3 !-left-[6px] rounded-full bg-white"></div>
            <span className="text-2xl font-semibold text-white">
              {miliSeconds}
            </span>
            <div className="relative h-2.5 w-2.5 sm:h-3 sm:w-3 -right-[6px] rounded-full bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TeamTimer;
