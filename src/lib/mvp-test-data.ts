import { AppState, ChildRecord, GroupConfig, Lesson } from "./mvp-types";

const BASE_DATE = "2026-03-16";

const GROUPS: GroupConfig[] = [
  {
    id: "g6",
    age: 6,
    name: "Rybki",
    instructor: "Anna Nowak",
    slots: [
      { weekday: 1, dayLabel: "Poniedzialek", time: "16:00" },
      { weekday: 4, dayLabel: "Czwartek", time: "16:30" },
    ],
  },
  {
    id: "g7",
    age: 7,
    name: "Delfinki",
    instructor: "Piotr Lis",
    slots: [
      { weekday: 3, dayLabel: "Sroda", time: "16:00" },
      { weekday: 5, dayLabel: "Piatek", time: "15:30" },
    ],
  },
  {
    id: "g8",
    age: 8,
    name: "Foki",
    instructor: "Karolina Bor",
    slots: [
      { weekday: 2, dayLabel: "Wtorek", time: "17:00" },
      { weekday: 4, dayLabel: "Czwartek", time: "17:30" },
    ],
  },
  {
    id: "g9",
    age: 9,
    name: "Rekiny",
    instructor: "Marta Pol",
    slots: [
      { weekday: 1, dayLabel: "Poniedzialek", time: "18:00" },
      { weekday: 3, dayLabel: "Sroda", time: "18:30" },
    ],
  },
  {
    id: "g10",
    age: 10,
    name: "Mistrzowie",
    instructor: "Adam Kurek",
    slots: [
      { weekday: 2, dayLabel: "Wtorek", time: "18:00" },
      { weekday: 5, dayLabel: "Piatek", time: "17:00" },
    ],
  },
  {
    id: "g11",
    age: 11,
    name: "Sport 1",
    instructor: "Lidia Maj",
    slots: [
      { weekday: 3, dayLabel: "Sroda", time: "19:00" },
      { weekday: 6, dayLabel: "Sobota", time: "10:00" },
    ],
  },
  {
    id: "g12",
    age: 12,
    name: "Sport 2",
    instructor: "Tomasz Wajda",
    slots: [
      { weekday: 4, dayLabel: "Czwartek", time: "19:00" },
      { weekday: 6, dayLabel: "Sobota", time: "11:00" },
    ],
  },
  {
    id: "g13",
    age: 13,
    name: "Sport 3",
    instructor: "Beata Lis",
    slots: [
      { weekday: 5, dayLabel: "Piatek", time: "19:00" },
      { weekday: 6, dayLabel: "Sobota", time: "12:00" },
    ],
  },
];

const NAMES = [
  "Ala",
  "Bartek",
  "Celina",
  "Damian",
  "Ewa",
  "Filip",
  "Gosia",
  "Hubert",
  "Iga",
  "Jarek",
  "Kasia",
  "Lena",
  "Marek",
  "Nina",
  "Olek",
  "Patryk",
  "Roksana",
  "Szymon",
  "Ula",
  "Wiktor",
];

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

function nextWeekday(baseDate: Date, weekday: number): Date {
  const day = baseDate.getDay();
  const distance = (weekday + 7 - day) % 7;
  return addDays(baseDate, distance);
}

function buildLessons(childId: string, slot: GroupConfig["slots"][number]): Lesson[] {
  const anchor = nextWeekday(new Date(BASE_DATE), slot.weekday);

  return Array.from({ length: 15 }, (_, index) => {
    const date = addDays(anchor, index * 7);

    return {
      id: `${childId}-lesson-${index + 1}`,
      nr: index + 1,
      dateISO: formatDateISO(date),
      day: slot.dayLabel,
      time: slot.time,
      status: "TAK",
      source: "BASE",
    };
  });
}

function buildChildren(): ChildRecord[] {
  const children: ChildRecord[] = [];
  let counter = 1;

  for (const group of GROUPS) {
    for (let i = 0; i < 15; i += 1) {
      const id = `child-${String(counter).padStart(3, "0")}`;
      const slot = group.slots[i % group.slots.length];
      const firstName = `${NAMES[counter % NAMES.length]} ${counter}`;

      children.push({
        id,
        number: `D-${String(counter).padStart(3, "0")}`,
        firstName,
        groupId: group.id,
        groupName: group.name,
        age: group.age,
        instructor: group.instructor,
        lessons: buildLessons(id, slot),
      });

      counter += 1;
    }
  }

  return children;
}

export function buildInitialState(): AppState {
  return {
    children: buildChildren(),
    freeSlots: [],
    takeovers: [],
    hiddenFreeSlotsByParent: {},
    updatedAtISO: new Date().toISOString(),
  };
}
