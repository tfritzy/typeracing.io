import React, { useCallback, useEffect, useState } from "react";
import { ToggleButton } from "./ToggleButton";

type View = {
  id: string;
  render: () => React.ReactElement;
};

interface CarrosselProps {
  views: View[];
}

export const Carrossel: React.FC<CarrosselProps> = ({ views }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = React.useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  if (itemsRef.current.length !== views.length) {
    itemsRef.current = Array(views.length).fill(null);
  }

  useEffect(() => {
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    // Initial width
    updateWidth();

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateWidth);
    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    // Cleanup
    return () => {
      if (scrollContainerRef.current) {
        resizeObserver.unobserve(scrollContainerRef.current);
      }
    };
  }, []);

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
          {v.id}
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
