import { RefObject, useCallback, useEffect, useMemo, useState } from "react";

const cursorXOffset = -2;
const cursorStartPos = -100;

type CursorProps = {
  targetObject: RefObject<HTMLSpanElement>;
  pulsing: boolean;
  disabled: boolean;
  text: JSX.Element | null;
  phrase: string;
};

export const Cursor = (props: CursorProps) => {
  const [cursorPos, setCursorPos] = useState({
    x: cursorStartPos,
    y: cursorStartPos,
    height: 0,
  });
  const [isImmediate, setIsImmediate] = useState(false);

  const updateCursorPositions = useCallback(
    (immediate = false) => {
      if (props.targetObject.current) {
        const cursorRect = props.targetObject.current.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(
          props.targetObject.current
        );

        const fontSize = parseFloat(computedStyle.fontSize);

        const newPos = {
          x: cursorRect.left + cursorXOffset,
          y: cursorRect.top + (cursorRect.height - fontSize) / 2,
          height: fontSize,
        };

        setIsImmediate(immediate);
        setCursorPos(newPos);
      }
    },
    [props.targetObject]
  );

  useEffect(() => {
    const handleResize = () => updateCursorPositions(true);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCursorPositions]);

  useEffect(() => {
    updateCursorPositions(false);
  }, [props.text, updateCursorPositions]);

  useEffect(() => {
    updateCursorPositions(true);
  }, [props.phrase, updateCursorPositions]);

  const cursor = useMemo(
    () => (
      <span
        className={`w-0.5 bg-base-400 fixed rounded-full ${
          !isImmediate ? "transition-all ease-out duration-150" : ""
        } ${props.pulsing ? "cursor" : ""}`}
        style={{
          top: cursorPos.y,
          left: cursorPos.x,
          height: cursorPos.height,
        }}
        hidden={props.disabled}
      />
    ),
    [cursorPos, props.disabled, props.pulsing, isImmediate]
  );

  return cursor;
};
