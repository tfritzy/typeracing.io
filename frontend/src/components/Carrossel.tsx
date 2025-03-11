import React, { useEffect, useState } from "react";

interface CarrosselProps {
  views: (JSX.Element | null)[];
  index: number;
}

export const Carrossel: React.FC<CarrosselProps> = ({ views, index }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [overlap, setOverlap] = useState<number>(0);

  if (itemsRef.current.length !== views.length) {
    itemsRef.current = Array(views.length).fill(null);
  }

  useEffect(() => {
    const calculateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerWidth(width - 5);

        const newOverlap = Math.max(0, (width - containerWidth) / 2);
        setOverlap(newOverlap);
      }
    };

    calculateDimensions();

    window.addEventListener("resize", calculateDimensions);

    return () => window.removeEventListener("resize", calculateDimensions);
  }, [containerWidth]);

  const rendered =
    containerWidth &&
    views.map((v, i) => (
      <div className="w-0">
        <div
          className="transition-opacity duration-500"
          ref={(el) => (itemsRef.current[i] = el)}
          style={{
            opacity: i === index ? 1 : 0,
            minWidth: containerWidth,
            pointerEvents: i === index ? "all" : "none",
          }}
          key={i}
        >
          {v}
        </div>
      </div>
    ));

  return (
    <div className="w-full" ref={containerRef}>
      <div
        className="relative flex flex-row pt-3 pb-3 overflow-x-hidden"
        ref={scrollContainerRef}
        style={{
          paddingLeft: overlap,
          paddingRight: overlap,
        }}
      >
        {rendered}
      </div>
    </div>
  );
};
