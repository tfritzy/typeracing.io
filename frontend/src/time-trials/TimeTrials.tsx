import React from "react";
import { decodeListTimeTrialsResponse, TimeTrialListItem } from "../compiled";
import { useAppSelector } from "../store/storeHooks";
import { RootState } from "../store/store";
import { PlayerState } from "../store/playerSlice";
import { Bar } from "../components/Bar";
import { formatPercentile, formatTimeSeconds } from "../helpers/time";
import { useNavigate } from "react-router-dom";
const apiUrl = process.env.REACT_APP_API_ADDRESS;

const PAGE_SIZE = 20;

interface Page {
  items: TimeTrialListItem[];
  continuationToken: string | null;
}

export function TimeTrials() {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const player: PlayerState = useAppSelector(
    (state: RootState) => state.player
  );

  const currentPage = pages[currentPageIndex];
  const hasNextPage = currentPage?.continuationToken != null;
  const hasPreviousPage = currentPageIndex > 0;
  const navigate = useNavigate();

  const handleRowClick = React.useCallback(
    (trialId: string) => {
      navigate(`/time-trials/${trialId}`);
    },
    [navigate]
  );

  const loadPage = async (
    token: string | null = null,
    goingForward: boolean = true
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const opts = {
        headers: { "X-Player-Id": player.id, "X-Auth-Token": player.token },
      };
      const url = new URL(apiUrl + "/api/list-time-trials");
      url.searchParams.append("pageSize", PAGE_SIZE.toString());
      if (token) {
        url.searchParams.append("continuationToken", token);
      }

      const response = await fetch(url.toString(), opts);
      const newContinuationToken = response.headers.get("x-continuation-token");

      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const decodedResponse = decodeListTimeTrialsResponse(data);

      const newPage: Page = {
        items: decodedResponse.time_trials!,
        continuationToken: newContinuationToken || null,
      };

      setPages((prevPages) => {
        if (goingForward) {
          // When going forward, add the new page to the end
          return [...prevPages, newPage];
        } else {
          // When going backward (refreshing current page), replace current page
          return prevPages.slice(0, currentPageIndex).concat([newPage]);
        }
      });
    } catch (err) {
      setError("Error loading time trials. Please try again later.");
      console.error("Error loading time trials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextPage = async () => {
    if (!hasNextPage || isLoading) return;

    await loadPage(currentPage.continuationToken, true);
    setCurrentPageIndex((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (!hasPreviousPage || isLoading) return;
    setCurrentPageIndex((prev) => prev - 1);
  };

  React.useEffect(() => {
    if (!player.id) {
      return;
    }

    if (pages.length === 0) {
      loadPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.id]);

  if (pages.length === 0 && isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-16">
      <h1 className="mb-6">Time trials</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="font-bold">
            <td className="w-max">Name</td>
            <td className="w-max max-w-[50px]">Percentile</td>
            <td className="w-max">Wpm</td>
            <td className="w-max">Time</td>
          </tr>
        </thead>
        <tbody className="gap-y-4">
          {currentPage?.items.map((t, index) => (
            <tr
              onClick={() => handleRowClick(t.id!)}
              className="cursor-pointer hover:bg-base-800"
              role="link"
              key={t.id || index}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleRowClick(t.id!);
                }
              }}
            >
              <td className="py-2">{t.name || "-"}</td>
              <td className="py-2 h-full font-mono">
                <div className="relative max-w-[80%]">
                  <div className="text-transparent">100th</div>
                  <div className="absolute left-0 top-0 w-full text-center z-10">
                    {formatPercentile(t.percentile!)}
                  </div>
                  {t.percentile !== -1 ? (
                    <Bar percentFilled={t.percentile! * 100} />
                  ) : (
                    <Bar percentFilled={3} />
                  )}
                </div>
              </td>
              <td className="py-2 font-mono text-accent">
                {(t.wpm && t.wpm >= 0 && t.wpm?.toString()) || ""}
              </td>
              <td className="py-2 font-mono">{formatTimeSeconds(t.time!)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-row w-full justify-between">
        <span className="py-2">Page {currentPageIndex + 1}</span>

        <div>
          <button
            onClick={goToPreviousPage}
            disabled={!hasPreviousPage || isLoading}
            className="px-3 py-1 font-medium rounded-md border border-base-200 text-sm mr-2"
            style={{
              opacity: !hasPreviousPage || isLoading ? 0.5 : 1,
            }}
          >
            Previous
          </button>

          <button
            onClick={goToNextPage}
            disabled={!hasNextPage || isLoading}
            className="px-3 py-1 font-medium rounded-md border border-base-200 text-sm"
            style={{
              opacity: !hasNextPage || isLoading ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
