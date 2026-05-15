"use client";

import React, { useEffect } from "react";

interface Props {
  textQueue: string[];
  charIntervalMs: number;
}

export function useTypewriter({ textQueue, charIntervalMs }: Props) {
  const [text, setText] = React.useState<string>("");

  useEffect(() => {
    const modTextQueue = textQueue.map((content) => content + "   ");
    const changeText = (
      idx: number,
      charIdx: number,
      forward: boolean,
    ): void => {
      setTimeout(() => {
        if (!forward) {
          setText((text) => text.slice(0, -1));
          const finishBackward = charIdx === 0;
          changeText(
            finishBackward ? (idx + 1) % modTextQueue.length : idx,
            finishBackward ? 0 : charIdx - 1,
            finishBackward,
          );
          return;
        }

        setText((text) => text + modTextQueue[idx].charAt(charIdx));

        const shouldMoveToNextText = charIdx + 1 >= modTextQueue[idx].length;

        if (shouldMoveToNextText && forward) {
          changeText(idx, charIdx, false);
          return;
        }

        const nextCharIdx = (charIdx + 1) % modTextQueue[idx].length;
        changeText(idx, nextCharIdx, true);
      }, charIntervalMs);
    };
    changeText(0, 0, true);
  }, [textQueue, charIntervalMs]);

  return text;
}
