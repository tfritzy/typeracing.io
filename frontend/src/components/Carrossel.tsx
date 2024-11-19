import { NavArrowLeft, NavArrowRight } from "iconoir-react";
import React, { useCallback } from "react";
type View = {
  id: string;
  render: () => React.ReactElement;
};
interface CarrosselProps {
  views: View[];
}
const itemWidth = 575;
const containerWidth = 700;
const overlap = (containerWidth - itemWidth) / 2;
export const Carrossel: React.FC<CarrosselProps> = ({ views }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = React.useState<number>(0);

  if (itemsRef.current.length !== views.length) {
    itemsRef.current = Array(views.length).fill(null);
  }

  const handleNavigation = useCallback(
    (direction: "next" | "prev"): void => {
      const newIndex =
        direction === "next"
          ? (index + 1) % views.length
          : (index - 1 + views.length) % views.length;
      setIndex(newIndex);

      const targetItem = itemsRef.current[newIndex];
      if (targetItem && scrollContainerRef.current) {
        targetItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    },
    [index, views.length]
  );

  const rendered = views.map((v, i) => (
    <div
      className="transition-opacity"
      ref={(el) => (itemsRef.current[i] = el)}
      style={{
        opacity: i === index ? 1 : 0.25,
        minWidth: itemWidth,
      }}
    >
      <div className="font-semibold pl-4 p-2">{views[i].id}</div>
      {v.render()}
    </div>
  ));
  return (
    <div className="w-full" style={{ maxWidth: containerWidth }}>
      <div className="font-semibold pl-4 p-2 border-b border-base-600">
        Results
      </div>
      <div
        className="relative flex flex-row space-x-3 pt-3 pb-3 overflow-x-scroll scrollbar-hide"
        ref={scrollContainerRef}
        style={{
          paddingLeft: overlap,
          paddingRight: overlap,
        }}
      >
        {rendered}
      </div>
      {index !== 0 && (
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl text-base-100 hover:text-accent cursor-pointer select-none pl-3 pr-3 min-h-[300px]"
          onClick={() => handleNavigation("prev")}
        >
          <NavArrowLeft width={28} />
        </button>
      )}
      {index !== views.length - 1 && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 text-4xl text-base-100 hover:text-accent cursor-pointer select-none pl-3 pr-3 min-h-[300px]"
          onClick={() => handleNavigation("next")}
        >
          <NavArrowRight width={28} />
        </button>
      )}
    </div>
  );
};
