import React, { useState, useRef, useEffect } from "react";

type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
};

export default function Tooltip({
  children,
  content,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Position to the right of the element with some padding
      let left = triggerRect.right + 8;
      let top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;

      // Check if tooltip would go off the right of the screen
      if (left + tooltipRect.width > window.innerWidth) {
        // Position to the left of the element instead
        left = triggerRect.left - tooltipRect.width - 8;
      }

      // Check if tooltip would go off the top or bottom of the screen
      if (top < 8) {
        top = 8;
      } else if (top + tooltipRect.height > window.innerHeight - 8) {
        top = window.innerHeight - tooltipRect.height - 8;
      }

      setPosition({
        top: top + window.scrollY,
        left: left + window.scrollX,
      });
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      className="inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 px-2 py-1 text-sm bg-base-800 text-base-100 rounded shadow-lg whitespace-nowrap pointer-events-none ${className}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
