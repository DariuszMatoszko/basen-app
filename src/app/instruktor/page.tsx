"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMvpStore } from "@/lib/use-mvp-store";

function formatDate(dateISO: string): string {
  const [year, month, day] = dateISO.split("-");
  return `${day}.${month}.${year}`;
}

export default function InstructorPage() {
  const { state, actions } = useMvpStore();
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; age: number; instructor: string; count: number }>();

    state.children.forEach((child) => {
      const current = map.get(child.groupName);
      if (current) {
        current.count += 1;
      } else {
        map.set(child.groupName, {
          name: child.groupName,
          age: child.age,
          instructor: child.instructor,
          count: 1,
        });
      }
    });

    return [...map.values()].sort((a, b) => a.age - b.age);
  }, [state.children]);

  const visibleChildren = useMemo(() => {
    return state.children
      .filter((child) => selectedGroup === "ALL" || child.groupName === selectedGroup)
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [selectedGroup, state.children]);

  const cancellations = useMemo(() => {
    return state.freeSlots
      .filter((slot) => slot.status === "OPEN")
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  }, [state.freeSlots]);

  const taken = useMemo(() => {
    return state.freeSlots
      .filter((slot) => slot.status === "TAKEN")
      .sort((a, b) => (b.takenAtISO ?? "").localeCompare(a.takenAtISO ?? ""));
  }, [state.freeSlots]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Widok instruktora</p>
              <h1 className="mt-1 text-2xl font-semibold">Lokalny system testowy MVP</h1>
              <p className="mt-1 text-sm text-slate-600">Grupy: 8 | Dzieci: {state.children.length} | Stan: test lokalny bez backendu</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => actions.resetStore()}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Reset danych testowych
              </button>
              <Link href="/" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Lista rodzicow
              </Link>
            </div>
          </div>
        </header>

        <section className="mb-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedGroup("ALL")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                selectedGroup === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Wszystkie grupy
            </button>
            {groups.map((group) => (
              <button
                key={group.name}
                onClick={() => setSelectedGroup(group.name)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  selectedGroup === group.name
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {group.age} lat - {group.name} ({group.count})
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-lg font-semibold">Dzieci i zajecia</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2">Nr</th>
                  <th className="px-3 py-2">Dziecko</th>
                  <th className="px-3 py-2">Grupa</th>
                  <th className="px-3 py-2">TAK/NIE</th>
                  <th className="px-3 py-2">Podglad zajec</th>
                </tr>
              </thead>
              <tbody>
                {visibleChildren.map((child) => {
                  const yes = child.lessons.filter((lesson) => lesson.status === "TAK").length;
                  const preview = child.lessons
                    .slice()
                    .sort((a, b) => a.nr - b.nr)
                    .slice(0, 2)
                    .map((lesson) => `${lesson.day} ${formatDate(lesson.dateISO)} ${lesson.time} (${lesson.status})`)
                    .join(" | ");

                  return (
                    <tr key={child.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{child.number}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{child.firstName}</div>
                        <Link href={`/rodzic/${child.id}`} className="text-xs text-sky-700 underline underline-offset-2">
                          Otworz panel rodzica
                        </Link>
                      </td>
                      <td className="px-3 py-2">{child.groupName}</td>
                      <td className="px-3 py-2">{yes}/15</td>
                      <td className="px-3 py-2 text-slate-600">{preview}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-3 text-lg font-semibold">Podglad anulowan / wolne miejsca</h2>
            {cancellations.length === 0 ? (
              <p className="text-sm text-slate-600">Brak aktywnych wolnych miejsc.</p>
            ) : (
              <div className="space-y-2">
                {cancellations.slice(0, 20).map((slot) => (
                  <div key={slot.id} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
                    <p className="font-medium">
                      {slot.day}, {formatDate(slot.dateISO)} {slot.time}
                    </p>
                    <p className="text-slate-600">
                      Zwolnil: {slot.sourceChildName} ({slot.groupName})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-3 text-lg font-semibold">Kto przejal wolne miejsce</h2>
            {taken.length === 0 ? (
              <p className="text-sm text-slate-600">Brak przejetych miejsc.</p>
            ) : (
              <div className="space-y-2">
                {taken.slice(0, 20).map((slot) => (
                  <div key={slot.id} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
                    <p className="font-medium">
                      {slot.day}, {formatDate(slot.dateISO)} {slot.time}
                    </p>
                    <p className="text-slate-600">
                      Zwolnil: {slot.sourceChildName} | Przejal: {slot.takenByChildName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
