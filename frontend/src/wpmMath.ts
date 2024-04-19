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
 let index = 0;
 let target = 1;
 while (index < times.length && times[index] < target) {
  index += 1;
 }

 const low = index - 1;
 const t =
  (times[index] - times[low]) * (target - times[low]);
 const lerpedValue =
  values[low] + (values[index] - values[low]) * t;
 perSecondValues.push(lerpedValue);

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

 console.log("rateBySecond", rateBySecond);

 return rateBySecond;
};
