import { RefObject, useCallback, useEffect, useMemo, useState } from "react";

const cursorXOffset = -2;
const cursorStartPos = -100;

type CursorProps = {
  targetObject: RefObject<HTMLSpanElement>;
  pulsing: boolean;
  disabled: boolean;
  input: string;
  phrase: string;
};

export const Cursor = (props: CursorProps) => {
  const [cursorPos, setCursorPos] = useState({
    x: cursorStartPos,
    y: cursorStartPos,
  });
  const [isImmediate, setIsImmediate] = useState(false);

  const updateCursorPositions = useCallback(
    (immediate = false) => {
      if (props.targetObject.current) {
        const cursorRect = props.targetObject.current.getBoundingClientRect();
        const newPos = {
          x: cursorRect.left + cursorXOffset,
          y: cursorRect.top + cursorRect.height / 2 - 16,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.input, props.targetObject.current, updateCursorPositions]);

  useEffect(() => {
    updateCursorPositions(true);
  }, [props.phrase, updateCursorPositions]);

  const cursor = useMemo(
    () => (
      <span
        className={`h-8 w-0.5 bg-base-400 fixed rounded-full ${
          !isImmediate ? "transition-all ease-out duration-150" : ""
        } ${props.pulsing ? "cursor" : ""}`}
        style={{
          top: cursorPos.y,
          left: cursorPos.x,
        }}
        hidden={props.disabled}
      />
    ),
    [cursorPos, props.disabled, props.pulsing, isImmediate]
  );

  return cursor;
};
