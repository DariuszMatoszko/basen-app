"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cancelLesson,
  dismissFreeSlot,
  getState,
  resetStore,
  subscribe,
  takeFreeSlot,
} from "./mvp-store";

export function useMvpStore() {
  const [state, setState] = useState(() => getState());

  useEffect(() => {
    return subscribe(() => {
      setState(getState());
    });
  }, []);

  return useMemo(
    () => ({
      state,
      actions: {
        cancelLesson,
        dismissFreeSlot,
        takeFreeSlot,
        resetStore,
      },
    }),
    [state],
  );
}
