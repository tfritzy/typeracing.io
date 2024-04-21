export const avg = (data: number[]): number => {
 let sum = 0;
 data.forEach((n) => (sum += n));
 return sum / data.length;
};

export const getTrailingAverages = (
 values: number[],
 bufferSize: number
) => {
 const buffer: number[] = [];
 const trailingAverages: number[] = [];
 for (const n of values) {
  buffer.push(n);
  if (buffer.length > bufferSize) {
   buffer.shift();
  }
  trailingAverages.push(avg(buffer));
 }

 return trailingAverages;
};

export const lerpValuesToSecond = (
 values: number[],
 times: number[]
) => {
 const perSecondValues: number[] = [values[0]];
 let index = 1;
 for (
  let target = 1;
  target < times[times.length - 1];
  target++
 ) {
  while (index < times.length && times[index] < target) {
   index += 1;
  }

  const low = index - 1;
  const fullRange = times[index] - times[low];
  const t = (target - times[low]) / fullRange;
  const lerpedValue =
   values[low] + (values[index] - values[low]) * t;

  console.log(
   "lerpData",
   low,
   index,
   target,
   t,
   lerpedValue,
   times[index],
   times[low]
  );

  perSecondValues.push(lerpedValue);
 }
 return perSecondValues;
};

export const getWpmData = (
 wordFinishTimes: number[],
 duration: number
) => {
 const rawWpmAtTime = wordFinishTimes.map(
  (t, i) => ((i + 1) / t) * 60
 );

 const rateBySecond = lerpValuesToSecond(
  rawWpmAtTime,
  wordFinishTimes
 );

 return rateBySecond;
};
