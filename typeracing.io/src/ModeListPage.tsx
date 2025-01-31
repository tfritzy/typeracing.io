import { useEffect, useMemo, useRef, useState } from "react";
import { groupedModes } from "./modes";
import { Link } from "react-router-dom";

export const ModeListPage = ({ shown }: { shown: boolean }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLElement>();

  const modesElements = useMemo(() => {
    const modeEls = [];
    const normalizedQuery = searchQuery.toLowerCase().trim();

    for (const [groupType, group] of Object.entries(groupedModes)) {
      const filteredModes = group.filter(
        (mode) =>
          mode.name.toLowerCase().includes(normalizedQuery) ||
          mode.description.toLowerCase().includes(normalizedQuery) ||
          group.toString().includes(normalizedQuery)
      );

      if (filteredModes.length === 0) continue;

      modeEls.push(
        <div key={groupType} className="col-span-2">
          <h2 className="text-lg font-medium text-base-300 capitalize">
            {groupType}
          </h2>
        </div>
      );

      filteredModes.forEach((mode) => {
        modeEls.push(
          <Link
            key={mode.type}
            className="flex flex-row space-x-1 rounded p-1 hover:bg-base-700"
            to={mode.type}
          >
            <div className="text-left">
              <div className="flex flex-row items-center space-x-2">
                <img
                  className="h-6 rounded-sm"
                  src={mode.icon}
                  alt={mode.name}
                />
                <h3 className="text-2xl text-base-400">{mode.name}</h3>
              </div>
              <div className="text-sm text-base-500">{mode.description}</div>
            </div>
          </Link>
        );
      });
    }
    return modeEls;
  }, [searchQuery]);

  useEffect(() => {
    if (shown) {
      searchRef.current?.focus();
    }

    if (!shown) {
      setSearchQuery("");
    }
  }, [shown]);

  return (
    <div
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                 bg-base-800 border border-base-700 rounded p-4 shadow-lg shadow-black/50 h-1/2 w-[600px] overflow-y-auto transition-all"
      style={{
        opacity: shown ? 1 : 0,
        pointerEvents: shown ? "auto" : "none",
        transform: shown ? "translate(-50%,-50%)" : "translate(-50%,-40%)",
      }}
    >
      <input
        className="w-full rounded-full bg-base-700 text-lg px-4 py-1 
                   outline-none focus:ring-2 focus:ring-base-500 focus:bg-base-800 
                   mb-4 text-base-400 placeholder-base-400"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoFocus
        ref={searchRef}
      />
      <div className="grid grid-cols-2 gap-4">{modesElements}</div>
    </div>
  );
};
