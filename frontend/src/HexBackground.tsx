import React, { useEffect, useRef } from "react";

interface HexagonGridProps {
 backgroundColor: string;
 hexagonColor: string;
 raceStartTime: number;
}

const HexagonGrid: React.FC<HexagonGridProps> = ({
 backgroundColor,
 hexagonColor,
 raceStartTime,
}) => {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const animationRef = useRef<number>();

 useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const resizeCanvas = () => {
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
  };

  const drawHexagon = (
   x: number,
   y: number,
   size: number
  ) => {
   ctx.beginPath();
   for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const xPos = x + size * Math.cos(angle);
    const yPos = y + size * Math.sin(angle);
    if (i === 0) {
     ctx.moveTo(xPos, yPos);
    } else {
     ctx.lineTo(xPos, yPos);
    }
   }
   ctx.closePath();
   ctx.fill();
  };

  const drawHexagonGrid = (
   ctx: CanvasRenderingContext2D,
   width: number,
   height: number,
   currentTime: number
  ) => {
   const hexSize = 25;
   const hexHeight = hexSize * Math.sqrt(3);
   const hexWidth = hexSize * 2;
   const rows = Math.ceil(height / hexHeight) + 1;
   const cols = Math.ceil(width / hexWidth) + 15;

   ctx.fillStyle = backgroundColor;
   ctx.fillRect(0, 0, width, height);
   ctx.fillStyle = hexagonColor;

   const timeUntilRace = raceStartTime - currentTime;
   console.log(timeUntilRace);
   const isPulsing =
    timeUntilRace <= 3000 && timeUntilRace > 0;

   for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
     const centerX = col * hexWidth * 0.75;
     const centerY =
      row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2);
     const distanceFromCenter =
      Math.abs(centerX - width / 2) / (width / 2);
     let gap =
      distanceFromCenter *
      distanceFromCenter *
      hexSize *
      0.02;

     let pulse = 0;
     if (isPulsing) {
      // Normalize the time to 0-1 range for the last 3 seconds
      const normalizedTime = (3000 - timeUntilRace) / 3000;
      pulse =
       Math.sin(normalizedTime * Math.PI * 6) *
       0.8 *
       (1 - normalizedTime);
     }

     drawHexagon(
      centerX,
      centerY,
      hexSize - gap + 0.7 + pulse
     );
    }
   }
  };

  const animate = (timestamp: number) => {
   resizeCanvas();
   drawHexagonGrid(
    ctx,
    canvas.width,
    canvas.height,
    timestamp
   );
   animationRef.current = requestAnimationFrame(animate);
  };

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  animationRef.current = requestAnimationFrame(animate);

  return () => {
   window.removeEventListener("resize", resizeCanvas);
   if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
   }
  };
 }, [backgroundColor, hexagonColor, raceStartTime]);

 return (
  <canvas ref={canvasRef} style={{ display: "block" }} />
 );
};

export default HexagonGrid;
