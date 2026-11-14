import { useEffect, useState } from 'react';

function getRemainingTime(targetTime) {
  const totalMilliseconds = Math.max(0, targetTime - Date.now());
  const totalSeconds = Math.ceil(totalMilliseconds / 1000);

  return {
    total: totalMilliseconds,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isComplete: totalMilliseconds === 0,
  };
}

export function useCountdown(targetDate) {
  const targetTime = new Date(targetDate).getTime();
  if (Number.isNaN(targetTime)) {
    throw new RangeError('useCountdown requires a valid target date.');
  }

  const [remainingTime, setRemainingTime] = useState(() => getRemainingTime(targetTime));

  useEffect(() => {
    const updateRemainingTime = () => setRemainingTime(getRemainingTime(targetTime));
    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, 1000);
    return () => window.clearInterval(intervalId);
  }, [targetTime]);

  return remainingTime;
}
