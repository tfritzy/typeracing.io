import React, { useState, useEffect } from "react";
import { Spinner } from "./Spinner";

type Props = {
  isLoading: boolean;
  delay: number;
  minDuration: number;
  children: JSX.Element;
};

export const LoadingWrapper = ({
  isLoading,
  delay = 300,
  minDuration = 500,
  children,
}: Props) => {
  const [shouldShowSpinner, setShouldShowSpinner] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(!isLoading);

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let minDurationTimer: NodeJS.Timeout;

    if (isLoading && !shouldShowSpinner) {
      // Only show loading spinner after delay to prevent flicker
      delayTimer = setTimeout(() => {
        setShouldShowSpinner(true);
      }, delay);
    }

    if (!isLoading && shouldShowSpinner) {
      // Ensure minimum duration of loading state
      minDurationTimer = setTimeout(() => {
        setShouldShowSpinner(false);
        setLoadingComplete(true);
      }, minDuration);
    }

    // Reset loading complete when loading starts again
    if (isLoading) {
      setLoadingComplete(false);
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(minDurationTimer);
    };
  }, [isLoading, delay, minDuration, shouldShowSpinner]);

  return (
    <div
      className={`transition-opacity duration-300 ${
        loadingComplete ? "opacity-100" : "opacity-0"
      }`}
    >
      {shouldShowSpinner ? <Spinner /> : children}
    </div>
  );
};
