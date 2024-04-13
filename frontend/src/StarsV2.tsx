import React, { useEffect, useRef, useState } from "react";
import { generateStar } from "./helpers/starGenerator";
import { splitmix32 } from "./helpers/splitmix32";

const NUM_RECTANGLES = 100; // Number of rectangles
const SCREEN_WIDTH = window.innerWidth; // Full width of the screen
const SCREEN_HEIGHT = window.innerHeight; // Full height of the screen

interface RectangleProps {
  startX: number;
  startY: number;
  startZ: number;
  baseSpeed: number;
}

const Star: React.FC<RectangleProps> = ({
  startX,
  startY,
  startZ,
  baseSpeed,
}) => {
  const [x, setX] = useState(startX * SCREEN_WIDTH);
  const requestRef = useRef<number>();
  const speed = baseSpeed * (100 * (1 - startZ));

  const animate = () => {
    setX((x) => {
      const newX = x - speed;
      return newX < -150 ? SCREEN_WIDTH : newX; // Reset to right if out of view
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [baseSpeed]);

  const height = 3 + 7 * (1 - startZ);
  const width = Math.max(height * (speed / 6), height);
  const radius = height / 2;
  const color = Math.random() > 0.5 ? "#d4cbff " : "#ffde67 ";

  return (
    <rect
      width={width}
      height={height}
      x={x}
      y={startY * SCREEN_HEIGHT}
      rx={radius}
      ry={radius}
      fill={color}
    />
  );
};

const Stars: React.FC = () => {
  const rng = splitmix32(0xdeadbeef); // Seed for random number generator
  const rectangles = Array.from({ length: NUM_RECTANGLES }, (_, index) =>
    generateStar(rng)
  );
  const [speedSlider, setSpeedSlider] = useState(0.5);

  console.log(rectangles);

  return (
    <div className="bg-neutral-900">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={speedSlider}
        onChange={(e) => setSpeedSlider(parseFloat(e.target.value))}
        className="w-1/2"
      />
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}
        className="bg-neutral-900"
      >
        {rectangles.map((star, index) => (
          <Star
            key={index}
            startX={star.x}
            startY={star.y}
            startZ={star.z}
            baseSpeed={speedSlider}
          />
        ))}
      </svg>
    </div>
  );
};

export default Stars;
