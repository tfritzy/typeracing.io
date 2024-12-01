import React from "react";
import { decodeListTimeTrialsResponse, TimeTrialListItem } from "../compiled";
import { useAppSelector } from "../store/storeHooks";
import { RootState } from "../store/store";
import { formatPercentile } from "../helpers/time";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { EvPlugXmark, Refresh, RefreshCircle } from "iconoir-react";
import { Spinner } from "../components/Spinner";
import { Hotkey } from "../components/Hotkey";

const apiUrl = process.env.REACT_APP_API_ADDRESS;
const PAGE_SIZE = 15;

interface Page {
  items: ResolvedListItem[];
  continuationToken: string | null;
}

function Bullet() {
  return <div className="w-2 h-2 rounded-full bg-base-500" />;
}

type ResolvedListItem = {
  id: string;
  name: string;
  length: number;
  time: number;
  percentile: number;
  wpm: number;
  difficulty: number;
};

function Difficulty(props: { difficulty: number }): JSX.Element {
  const { difficulty } = props;
  const dots = React.useMemo(() => {
    switch (difficulty) {
      case 1:
        return <span className="text-green-500">Easy</span>;
      case 2:
        return <span className="text-yellow-400">Medium</span>;
      case 3:
        return <span className="text-red-500">Hard</span>;
      case 4:
        return <span className="text-purple-500">Not worth it</span>;
    }
  }, [difficulty]);

  return <div className="flex flex-row space-x-1">{dots}</div>;
}

const parseTimeTrials = (
  result: TimeTrialListItem[] | undefined
): ResolvedListItem[] => {
  console.log(result);
  const resolved: ResolvedListItem[] = [];
  result?.forEach((r) => {
    if (!r.id || !r.name || !r.wpm || !r.time) {
      console.log("Rejecting", r);
      return;
    }

    resolved.push({
      id: r.id,
      name: r.name,
      percentile: !r.percentile || r.percentile === -1 ? 0 : r.percentile,
      time: r.time || 0,
      wpm: !r.wpm || r.wpm === -1 ? 0 : r.wpm,
      length: r.length || 0,
      difficulty: r.difficulty || 0,
    });
  });

  return resolved;
};

const TimeTrialRow = React.memo(
  ({
    trial,
    onRowClick,
    index,
  }: {
    trial: ResolvedListItem;
    onRowClick: (id: string) => void;
    index: number;
  }) => {
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onRowClick(trial.id);
      }
    };

    return (
      <tr
        onClick={() => onRowClick(trial.id)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        className="hover:bg-base-800-50 cursor-pointer focus:bg-base-800-50"
      >
        <td className="py-3 font-medium text-base-200 flex flex-row items-center space-x-2">
          <Hotkey code={String.fromCharCode(97 + index)} />
          <span>{trial.name}</span>
        </td>
        <td className="py-3 font-medium">
          <Difficulty difficulty={trial.difficulty} />
        </td>
        <td className="py-3">
          <div className="relative w-full h-6">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-mono text-emerald-500 z-10">
              {trial.percentile ? formatPercentile(trial.percentile) : ""}
            </span>
            <div className="absolute bottom-0 w-full h-2 rounded-full bg-base-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-200"
                style={{ width: `${trial.percentile * 100}%` }}
              />
            </div>
          </div>
        </td>
        <td className="py-3 text-right font-mono text-emerald-400">
          {trial.wpm ? trial.wpm.toFixed(1) : ""}
        </td>
      </tr>
    );
  }
);

TimeTrialRow.displayName = "TimeTrialRow";

export function TimeTrials() {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const player = useAppSelector((state: RootState) => state.player);
  const navigate = useNavigate();

  const currentPage = pages[currentPageIndex];
  const hasNextPage = currentPage?.continuationToken != null;
  const hasPreviousPage = currentPageIndex > 0;

  const loadPage = React.useCallback(
    async (token: string | null = null, goingForward: boolean = true) => {
      setIsLoading(true);
      setError(null);

      try {
        const opts = {
          headers: { "X-Player-Id": player.id, "X-Auth-Token": player.token },
        };
        const url = new URL(`${apiUrl}/api/list-time-trials`);
        url.searchParams.append("pageSize", PAGE_SIZE.toString());
        if (token) {
          url.searchParams.append("continuationToken", token);
        }

        const response = await fetch(url.toString(), opts);
        const newContinuationToken = response.headers.get(
          "x-continuation-token"
        );

        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const decodedResponse = decodeListTimeTrialsResponse(data);

        const newPage: Page = {
          items: parseTimeTrials(decodedResponse.time_trials),
          continuationToken: newContinuationToken || null,
        };

        setPages((prevPages) => {
          if (goingForward) {
            return [...prevPages, newPage];
          } else {
            return prevPages.slice(0, currentPageIndex).concat([newPage]);
          }
        });
      } catch (err) {
        setError("Error loading time trials. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [player.id, player.token, currentPageIndex]
  );

  const handleRowClick = React.useCallback(
    (trialId: string) => {
      navigate(`/time-trials/${trialId}`);
    },
    [navigate]
  );

  const goToNextPage = React.useCallback(async () => {
    if (!hasNextPage || isLoading) return;
    await loadPage(currentPage.continuationToken, true);
    setCurrentPageIndex((prev) => prev + 1);
  }, [hasNextPage, isLoading, currentPage?.continuationToken, loadPage]);

  const goToPreviousPage = React.useCallback(() => {
    if (!hasPreviousPage || isLoading) return;
    setCurrentPageIndex((prev) => prev - 1);
  }, [hasPreviousPage, isLoading]);

  React.useEffect(() => {
    if (!player.id || pages.length !== 0) return;
    loadPage();
  }, [player.id, pages.length, loadPage]);

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore key presses if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === ",") {
        !isLoading && hasPreviousPage && goToPreviousPage();
        return;
      }
      if (key === ".") {
        !isLoading && hasNextPage && goToNextPage();
        return;
      }

      if (currentPage?.items) {
        const index = key.charCodeAt(0) - 97;
        if (index >= 0 && index < currentPage.items.length) {
          handleRowClick(currentPage.items[index].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    currentPage?.items,
    goToNextPage,
    goToPreviousPage,
    handleRowClick,
    hasNextPage,
    hasPreviousPage,
    isLoading,
  ]);

  if (error) {
    return (
      <div className="grow text-error-color flex flex-col items-center space-y-4 justify-center px-4 py-3 rounded relative">
        <div className="p-2 rounded border border-error-color">
          <EvPlugXmark width={32} height={32} />
        </div>
        <div>{error}</div>
        <Button type="error" onClick={() => loadPage()}>
          <div className="flex flex-row space-x-1 items-center">
            <div>Retry</div>
            <Refresh height={16} />
          </div>
        </Button>
      </div>
    );
  }

  if (pages.length === 0 && isLoading) {
    return (
      <div className="flex justify-center p-8 grow">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto grow">
      <div className="">
        <div className="">
          <table className="w-full">
            <thead>
              <tr className="border-b border-t border-base-700">
                <th className="text-left py-3 text-base-200 font-semibold">
                  Name
                </th>
                <th className="text-left py-3 text-base-200 font-semibold">
                  Difficulty
                </th>
                <th className="text-left py-3 text-base-200 font-semibold w-48">
                  Percentile
                </th>
                <th className="text-right py-3 text-base-200 font-semibold">
                  WPM
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPage?.items.map((trial, i) => (
                <TimeTrialRow
                  key={trial.id}
                  trial={trial}
                  onRowClick={handleRowClick}
                  index={i}
                />
              ))}
            </tbody>
          </table>

          {error && (
            <div className="flex items-center justify-center p-8 text-red-400 gap-2">
              <EvPlugXmark className="h-5 w-5" />
              <p>{error}</p>
              <Button type="secondary" onClick={() => loadPage()}>
                <RefreshCircle className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          )}

          <div className="flex justify-between items-center mt-6 px-2">
            <span className="text-sm text-base-400">
              Page {currentPageIndex + 1}
            </span>
            <div className="flex gap-2">
              <button
                className="flex flex-row space-x-1 items-center gap-1 px-3 py-1 text-sm font-medium rounded bg-base-800 hover:bg-base-700 disabled:opacity-50 transition-colors"
                onClick={goToPreviousPage}
                disabled={!hasPreviousPage || isLoading}
              >
                <Hotkey code="," />
                <span>Previous</span>
              </button>
              <button
                className="flex flex-row space-x-1 items-center gap-1 px-3 py-1 text-sm font-medium rounded bg-base-800 hover:bg-base-700 disabled:opacity-50 transition-colors"
                onClick={goToNextPage}
                disabled={!hasNextPage || isLoading}
              >
                <Hotkey code="." />
                <span>Next</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
