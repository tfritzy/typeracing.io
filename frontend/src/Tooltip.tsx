import React, { useState, useEffect, useRef } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  delay = 100,
}) => {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const showTooltip = () => {
    const id = window.setTimeout(() => {
      setVisible(true);
      updatePosition();
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setVisible(false);
  };

  const updatePosition = () => {
    if (tooltipRef.current && wrapperRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();

      let top = wrapperRect.top - tooltipRect.height - 10; // 10px for margin
      let left =
        wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2;

      // Adjust if off screen
      if (top < 0) {
        top = wrapperRect.bottom + 10;
      }
      if (left < 0) {
        left = 10;
      } else if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 10;
      }

      setPosition({ top, left });
    }
  };

  useEffect(() => {
    if (visible) {
      updatePosition();
    }
  }, [visible]);

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      ref={wrapperRef}
    >
      {children}
      {visible && (
        <div
          className="tooltip-content"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
          ref={tooltipRef}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
