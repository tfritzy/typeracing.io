import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GroupType, Mode, ModeType } from "@shared/types";

export const ModeListPage = ({
  shown,
  onClose,
  modes,
  subRoute,
  mode,
}: {
  shown: boolean;
  onClose: () => void;
  modes: Partial<Record<GroupType, Mode[]>>;
  subRoute: string | undefined;
  mode: ModeType;
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleHotkeys = async (event: KeyboardEvent) => {
      if (event.key === "Escape" && shown) {
        searchRef.current?.blur();
        event.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [onClose, shown]);

  const [modesElements, numElements] = useMemo(() => {
    const modeEls = [];
    const normalizedQuery = searchQuery.toLowerCase().trim();
    let index = 0;

    for (const [groupType, group] of Object.entries(modes)) {
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

      filteredModes.forEach((iMode) => {
        const route = subRoute
          ? `/${subRoute}/${iMode.type}`
          : `/${iMode.type}`;
        modeEls.push(
          <Link
            key={iMode.type}
            className="flex flex-row space-x-1 rounded p-1 px-3 border hover:bg-base-700"
            to={route}
            style={{
              backgroundColor: index === selectedIndex ? "var(--base-700)" : "",
              borderColor:
                index === selectedIndex ? "var(--base-500)" : "var(--base-800)",
            }}
            aria-selected={index === selectedIndex}
            tabIndex={-1}
            onMouseUp={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="text-left">
              <div className="flex flex-row items-center space-x-4">
                <img
                  className="h-8 rounded-sm"
                  src={iMode.icon}
                  alt={iMode.name}
                />
                <div>
                  <h3 className="text-lg text-base-300">{iMode.name}</h3>
                  <div className="text-sm text-base-400">
                    {iMode.description}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );

        if (selectedIndex === -1 && iMode.type === mode) {
          setSelectedIndex(index);
        }

        index += 1;
      });
    }
    return [modeEls, index];
  }, [mode, modes, searchQuery, selectedIndex, subRoute]);

  useEffect(() => {
    const handleHotkeys = async (event: KeyboardEvent) => {
      if (!shown) return;

      let newIndex = selectedIndex;

      if (event.key === "Enter") {
        const selectedElement = document.querySelector(
          '[aria-selected="true"]'
        ) as HTMLElement;
        selectedElement?.click();
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        newIndex = event.shiftKey ? selectedIndex - 1 : selectedIndex + 1;
      }
      if (event.key === "ArrowDown") {
        newIndex = selectedIndex + 1;
      }
      if (event.key === "ArrowUp") {
        newIndex = selectedIndex - 1;
      }
      if (event.key === "ArrowRight") {
        newIndex = selectedIndex + 1;
      }
      if (event.key === "ArrowLeft") {
        newIndex = selectedIndex - 1;
      }

      if (newIndex >= numElements) {
        newIndex = newIndex % numElements;
      }

      if (newIndex < 0) {
        newIndex += numElements;
      }

      newIndex = Math.max(0, Math.min(newIndex, numElements - 1));

      setSelectedIndex(newIndex);
    };

    document.addEventListener("keydown", handleHotkeys);
    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [selectedIndex, modesElements, numElements, shown, onClose]);

  useEffect(() => {
    if (shown) {
      searchRef.current?.focus();
    } else {
      setSearchQuery("");
      setSelectedIndex(-1);

      const element = document.getElementById("type-box");
      if (
        document.activeElement !== element &&
        document.activeElement?.tagName !== "INPUT"
      ) {
        element?.focus();
      }
    }
  }, [shown]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    const selectedElement = document.querySelector('[aria-selected="true"]');
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    }
  }, [selectedIndex]);

  return (
    <>
      <div
        className="fixed top-1/2 left-1/2 bg-base-800 border border-base-700 rounded-lg shadow-lg shadow-black/50 w-[600px] overflow-y-auto transition-all"
        style={{
          opacity: shown ? 1 : 0,
          pointerEvents: shown ? "auto" : "none",
          transform: shown ? "translate(-50%,-50%)" : "translate(-50%, -45%)",
        }}
      >
        <div className="border-b border-base-700">
          <input
            className="w-full text-lg px-4 py-2 outline-none bg-base-800 text-base-400 placeholder-base-400"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            ref={searchRef}
            onBlur={onClose}
            disabled={!shown}
          />
        </div>
        <div className="h-[600px] overflow-y-auto p-4">
          <div className="flex flex-col space-y-2">{modesElements}</div>
        </div>
      </div>
    </>
  );
};
