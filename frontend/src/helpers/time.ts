export const formatTimeSeconds = (time_s: number): string => {
  if (time_s < 0) {
    return "";
  }

  let diffInHrs = time_s / 3600;
  let hh = Math.floor(diffInHrs);

  let diffInMin = (diffInHrs - hh) * 60;
  let mm = Math.floor(diffInMin);

  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);

  let diffInMs = (diffInSec - diffInMin) * 1000;
  let ms = Math.floor(diffInMs);

  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");
  let formattedMS = ms.toString().padStart(2, "0").slice(0, 3);

  return `${formattedMM}:${formattedSS}.${formattedMS}`;
};

export const formatTime = (time_ms: number): string => {
  if (time_ms < 0) {
    return "";
  }

  let diffInHrs = time_ms / 3600000;
  let hh = Math.floor(diffInHrs);

  let diffInMin = (diffInHrs - hh) * 60;
  let mm = Math.floor(diffInMin);

  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);

  let diffInMs = (diffInSec - ss) * 100;
  let ms = Math.floor(diffInMs);

  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");
  let formattedMS = ms.toString().padStart(2, "0");

  return `${formattedMM}:${formattedSS}.${formattedMS}`;
};

export const formatWpm = (wpm: number): string => {
  return wpm.toFixed(1);
};

export const formatAccuracy = (accuracy: number): string => {
  return (accuracy * 100).toFixed(1) + "%";
};

export const formatDash = (accuracy: number): string => {
  return "";
};

export const formatPercentile = (percentile: number): string => {
  if (percentile < 0) {
    return "";
  }

  const number =
    percentile <= 1 ? Math.round(percentile * 100) : Math.round(percentile);

  if (number % 100 >= 11 && number % 100 <= 13) {
    return `${number}th`;
  }

  switch (number % 10) {
    case 1:
      return `${number}st`;
    case 2:
      return `${number}nd`;
    case 3:
      return `${number}rd`;
    default:
      return `${number}th`;
  }
};
