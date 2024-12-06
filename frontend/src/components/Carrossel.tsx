import React, { useCallback } from "react";
import { ToggleButton } from "./ToggleButton";
import { Hotkey } from "./Hotkey";

type View = {
  id: string;
  hotkey: string;
  render: () => React.ReactElement;
};

interface CarrosselProps {
  views: View[];
  disabled: boolean;
  containerWidth: number;
}

export const Carrossel: React.FC<CarrosselProps> = ({
  views,
  disabled,
  containerWidth,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = React.useState<number>(0);

  if (itemsRef.current.length !== views.length) {
    itemsRef.current = Array(views.length).fill(null);
  }

  const handleNavigation = useCallback((newIndex: number): void => {
    setIndex(newIndex);
    const targetItem = itemsRef.current[newIndex];
    if (targetItem && scrollContainerRef.current) {
      targetItem.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, []);

  React.useEffect(() => {
    const handleHotkeys = (event: KeyboardEvent) => {
      if (disabled) {
        return;
      }

      views.forEach((v, i) => {
        if (v.hotkey === event.key) {
          handleNavigation(i);
        }
      });
    };

    document.addEventListener("keydown", handleHotkeys);

    return () => {
      document.removeEventListener("keydown", handleHotkeys);
    };
  }, [disabled, handleNavigation, views]);

  const rendered = views.map((v, i) => (
    <div
      className="transition-opacity"
      ref={(el) => (itemsRef.current[i] = el)}
      key={v.id}
      style={{
        opacity: i === index ? 1 : 0.25,
        width: `${containerWidth}px`,
        minWidth: `${containerWidth}px`,
      }}
    >
      {v.render()}
    </div>
  ));

  const buttons = React.useMemo(
    () =>
      views.map((v, i) => (
        <ToggleButton
          onSelect={() => handleNavigation(i)}
          selected={index === i}
          key={i}
        >
          <div className="flex flex-row space-x-2 items-center">
            <div>{v.id}</div>
            <Hotkey code={v.hotkey} accent={index === i} />
          </div>
        </ToggleButton>
      )),
    [handleNavigation, index, views]
  );

  return (
    <div className="w-full">
      <div className="flex flex-row space-x-2 mb-4">{buttons}</div>
      <div
        className="relative flex flex-row space-x-3 pt-3 pb-3 overflow-x-scroll scrollbar-hide touch-action-none"
        ref={scrollContainerRef}
      >
        {rendered}
      </div>
    </div>
  );
};
