export type LessonStatus = "TAK" | "NIE";

export type GroupConfig = {
  id: string;
  age: number;
  name: string;
  instructor: string;
  slots: Array<{ weekday: number; dayLabel: string; time: string }>;
};

export type Lesson = {
  id: string;
  nr: number;
  dateISO: string;
  day: string;
  time: string;
  status: LessonStatus;
  source: "BASE" | "SWAP";
};

export type ChildRecord = {
  id: string;
  number: string;
  firstName: string;
  lastName: string;
  fullName: string;
  groupId: string;
  groupName: string;
  age: number;
  instructor: string;
  lessons: Lesson[];
};

export type FreeSlot = {
  id: string;
  sourceLessonId: string;
  sourceChildId: string;
  sourceChildName: string;
  groupName: string;
  dateISO: string;
  day: string;
  time: string;
  createdAtISO: string;
  status: "OPEN" | "TAKEN";
  takenByChildId?: string;
  takenByChildName?: string;
  takenAtISO?: string;
};

export type TakeoverLog = {
  id: string;
  freeSlotId: string;
  fromChildId: string;
  fromChildName: string;
  toChildId: string;
  toChildName: string;
  atISO: string;
};

export type PlanItem = {
  nr: number;
  topic: string;
  recommendations: string;
};

export type ParentMessage = {
  id: string;
  childId: string;
  author: "RODZIC" | "INSTRUKTOR";
  text: string;
  createdAtISO: string;
  unreadForInstructor: boolean;
};

export type AppState = {
  children: ChildRecord[];
  freeSlots: FreeSlot[];
  takeovers: TakeoverLog[];
  hiddenFreeSlotsByParent: Record<string, string[]>;
  groupPlans: Record<string, PlanItem[]>;
  parentMessages: ParentMessage[];
  updatedAtISO: string;
};

export type ActionResult = {
  ok: boolean;
  message?: string;
};
