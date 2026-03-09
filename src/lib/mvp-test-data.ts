import { AppState, ChildRecord, GroupConfig, Lesson, ParentMessage, PlanItem } from "./mvp-types";

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

const FIRST_NAMES = [
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

const LAST_NAMES = [
  "Kowalski",
  "Nowak",
  "Wisniewski",
  "Wojcik",
  "Kaczmarek",
  "Mazur",
  "Krupa",
  "Pawlak",
  "Michalski",
  "Kaminski",
];

const TOPICS = [
  "Oswojenie z woda i oddech",
  "Praca nog na desce",
  "Rownowaga i pozycja ciala",
  "Skok do wody i bezpieczne wejscie",
  "Praca rak w kraulu",
  "Laczenie ruchu rak i nog",
  "Nawrot przy scianie",
  "Technika grzbietowa",
  "Start z murka",
  "Rytm oddechu w kraulu",
  "Elementy stylu klasycznego",
  "Doskonalenie grzbietu",
  "Szybkosc na odcinku 25 m",
  "Wytrzymalosc i tempo",
  "Test koncowy i podsumowanie",
];

const RECOMMENDATIONS = [
  "Przypomniec okularki i recznik.",
  "Przyjsc 10 minut wczesniej na rozgrzewke.",
  "Powtorzyc oddychanie bokiem po zajeciach.",
  "Zabrac klapki i czepek.",
  "Po treningu wypic wode i rozciagnac barki.",
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
      const firstName = FIRST_NAMES[counter % FIRST_NAMES.length];
      const lastName = LAST_NAMES[counter % LAST_NAMES.length];

      children.push({
        id,
        number: `D-${String(counter).padStart(3, "0")}`,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
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

function buildGroupPlans(): Record<string, PlanItem[]> {
  const plans: Record<string, PlanItem[]> = {};

  GROUPS.forEach((group, groupIndex) => {
    plans[group.id] = Array.from({ length: 15 }, (_, index) => ({
      nr: index + 1,
      topic: TOPICS[(index + groupIndex) % TOPICS.length],
      recommendations: RECOMMENDATIONS[(index + groupIndex) % RECOMMENDATIONS.length],
    }));
  });

  return plans;
}

function buildMessages(children: ChildRecord[]): ParentMessage[] {
  const messages: ParentMessage[] = [];

  children.slice(0, 24).forEach((child, index) => {
    const created = addDays(new Date(BASE_DATE), index % 10).toISOString();

    messages.push({
      id: `msg-parent-${child.id}`,
      childId: child.id,
      author: "RODZIC",
      text:
        index % 2 === 0
          ? "Dziecko ma lekki katar. Dam znac rano, czy bedzie na zajeciach."
          : "Czy mozna zrobic krotka serie oddechowa po zajeciach?",
      createdAtISO: created,
      unreadForInstructor: index % 3 === 0,
    });

    messages.push({
      id: `msg-instr-${child.id}`,
      childId: child.id,
      author: "INSTRUKTOR",
      text:
        index % 2 === 0
          ? "Dziekuje za informacje. Prosze obserwowac samopoczucie i dac znac przed treningiem."
          : "Tak, dodamy dodatkowe cwiczenie oddechowe po glownej czesci.",
      createdAtISO: addDays(new Date(created), 1).toISOString(),
      unreadForInstructor: false,
    });
  });

  return messages;
}

export function buildInitialState(): AppState {
  const children = buildChildren();

  return {
    children,
    freeSlots: [],
    takeovers: [],
    hiddenFreeSlotsByParent: {},
    groupPlans: buildGroupPlans(),
    parentMessages: buildMessages(children),
    updatedAtISO: new Date().toISOString(),
  };
}
