"use client";

import { buildInitialState } from "./mvp-test-data";
import { ActionResult, AppState, ChildRecord, FreeSlot, Lesson } from "./mvp-types";

const STORAGE_KEY = "basen1-mvp-store-v1";
const CHANNEL_NAME = "basen1-mvp-sync-v1";
const SOURCE_ID = `tab-${Math.random().toString(36).slice(2)}`;

let inMemoryState: AppState | null = null;
let channel: BroadcastChannel | null = null;
const listeners = new Set<() => void>();
let isInitialized = false;

function nowISO(): string {
  return new Date().toISOString();
}

function parseState(raw: string | null): AppState | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

function getFutureScore(lesson: Lesson): number {
  return Number(lesson.dateISO.replaceAll("-", ""));
}

function findChild(children: ChildRecord[], childId: string): ChildRecord | undefined {
  return children.find((child) => child.id === childId);
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function ensureInitialized(): void {
  if (typeof window === "undefined" || isInitialized) return;

  const persisted = parseState(window.localStorage.getItem(STORAGE_KEY));
  inMemoryState = persisted ?? buildInitialState();

  if (!persisted) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryState));
  }

  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event) => {
    if (event?.data?.type !== "STATE_UPDATED") return;
    if (event?.data?.source === SOURCE_ID) return;

    const latest = parseState(window.localStorage.getItem(STORAGE_KEY));
    if (!latest) return;

    inMemoryState = latest;
    emitChange();
  };

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;

    const latest = parseState(event.newValue);
    if (!latest) return;

    inMemoryState = latest;
    emitChange();
  });

  isInitialized = true;
}

function persistState(next: AppState): void {
  if (typeof window === "undefined") return;

  inMemoryState = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  channel?.postMessage({ type: "STATE_UPDATED", source: SOURCE_ID, at: nowISO() });
  emitChange();
}

function mutateState(mutation: (draft: AppState) => ActionResult): ActionResult {
  ensureInitialized();
  const current = inMemoryState ?? buildInitialState();
  const draft: AppState = JSON.parse(JSON.stringify(current));

  const result = mutation(draft);
  if (!result.ok) return result;

  draft.updatedAtISO = nowISO();
  persistState(draft);
  return result;
}

function createFreeSlot(fromChild: ChildRecord, lesson: Lesson): FreeSlot {
  return {
    id: `slot-${crypto.randomUUID()}`,
    sourceLessonId: lesson.id,
    sourceChildId: fromChild.id,
    sourceChildName: fromChild.firstName,
    groupName: fromChild.groupName,
    dateISO: lesson.dateISO,
    day: lesson.day,
    time: lesson.time,
    createdAtISO: nowISO(),
    status: "OPEN",
  };
}

export function getState(): AppState {
  ensureInitialized();
  if (!inMemoryState) {
    inMemoryState = buildInitialState();
  }
  return inMemoryState;
}

export function subscribe(listener: () => void): () => void {
  ensureInitialized();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetStore(): void {
  ensureInitialized();
  persistState(buildInitialState());
}

export function cancelLesson(childId: string, lessonId: string): ActionResult {
  return mutateState((draft) => {
    const child = findChild(draft.children, childId);
    if (!child) return { ok: false, message: "Nie znaleziono dziecka." };

    const lesson = child.lessons.find((item) => item.id === lessonId);
    if (!lesson) return { ok: false, message: "Nie znaleziono zajec." };
    if (lesson.status === "NIE") return { ok: false, message: "Te zajecia sa juz anulowane." };

    lesson.status = "NIE";
    draft.freeSlots.unshift(createFreeSlot(child, lesson));

    return { ok: true };
  });
}

export function dismissFreeSlot(parentId: string, freeSlotId: string): ActionResult {
  return mutateState((draft) => {
    const current = draft.hiddenFreeSlotsByParent[parentId] ?? [];
    if (!current.includes(freeSlotId)) {
      draft.hiddenFreeSlotsByParent[parentId] = [...current, freeSlotId];
    }
    return { ok: true };
  });
}

function openReplacementSlot(draft: AppState, child: ChildRecord, lesson: Lesson): void {
  const replacementFreeSlot = createFreeSlot(child, lesson);
  draft.freeSlots.unshift(replacementFreeSlot);
}

export function takeFreeSlot(childId: string, freeSlotId: string): ActionResult {
  return mutateState((draft) => {
    const child = findChild(draft.children, childId);
    if (!child) return { ok: false, message: "Nie znaleziono dziecka." };

    const freeSlot = draft.freeSlots.find((slot) => slot.id === freeSlotId);
    if (!freeSlot) return { ok: false, message: "Nie znaleziono wolnego miejsca." };
    if (freeSlot.status !== "OPEN") return { ok: false, message: "To miejsce jest juz zajete." };
    if (freeSlot.sourceChildId === childId) {
      return { ok: false, message: "Nie mozna przejac miejsca po swoim dziecku." };
    }

    const occupiedLesson = child.lessons.find(
      (lesson) =>
        lesson.dateISO === freeSlot.dateISO &&
        lesson.day === freeSlot.day &&
        lesson.time === freeSlot.time &&
        lesson.status === "TAK",
    );
    if (occupiedLesson) {
      return {
        ok: false,
        message: "To dziecko ma juz zajecia w tym terminie.",
      };
    }

    const sortedFutureLessons = [...child.lessons].sort(
      (a, b) => getFutureScore(b) - getFutureScore(a),
    );

    const lessonToSwap = sortedFutureLessons.find((lesson) => lesson.id !== freeSlot.sourceLessonId);
    if (!lessonToSwap) {
      return { ok: false, message: "Brak zajec do podmiany." };
    }

    const oldLessonSnapshot: Lesson = { ...lessonToSwap };

    lessonToSwap.dateISO = freeSlot.dateISO;
    lessonToSwap.day = freeSlot.day;
    lessonToSwap.time = freeSlot.time;
    lessonToSwap.status = "TAK";
    lessonToSwap.source = "SWAP";

    const sameHidden = draft.hiddenFreeSlotsByParent[childId] ?? [];
    draft.hiddenFreeSlotsByParent[childId] = sameHidden.filter((id) => id !== freeSlotId);

    freeSlot.status = "TAKEN";
    freeSlot.takenByChildId = child.id;
    freeSlot.takenByChildName = child.firstName;
    freeSlot.takenAtISO = nowISO();

    openReplacementSlot(draft, child, oldLessonSnapshot);

    draft.takeovers.unshift({
      id: `take-${crypto.randomUUID()}`,
      freeSlotId: freeSlot.id,
      fromChildId: freeSlot.sourceChildId,
      fromChildName: freeSlot.sourceChildName,
      toChildId: child.id,
      toChildName: child.firstName,
      atISO: nowISO(),
    });

    return { ok: true };
  });
}
