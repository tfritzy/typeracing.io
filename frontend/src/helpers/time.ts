export const formatTime = (delta_millis: number): string => {
    if (delta_millis < 0) {
        throw new Error("Time delta cannot be negative");
    }

    const minutes = Math.floor(delta_millis / 60000);
    const remainingMillis = delta_millis % 60000;
    const seconds = Math.floor(remainingMillis / 1000);
    const ms = remainingMillis % 1000;

    // Format milliseconds to 3 decimal places
    const msStr = ms.toFixed(3).padStart(3, '0');
    
    const secondsStr = seconds.toFixed(0).toString().padStart(2, '0');

    if (minutes === 0) {
        return `${secondsStr}:${msStr}`;
    }

    return `${minutes}:${secondsStr}:${msStr}`;
};