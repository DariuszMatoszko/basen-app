"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMvpStore } from "@/lib/use-mvp-store";

type ParentViewProps = {
  parentId: string;
};

function formatDate(dateISO: string): string {
  const [year, month, day] = dateISO.split("-");
  return `${day}.${month}.${year}`;
}

export default function ParentView({ parentId }: ParentViewProps) {
  const { state, actions } = useMvpStore();
  const [notice, setNotice] = useState<string>("");

  const child = useMemo(
    () => state.children.find((item) => item.id === parentId),
    [parentId, state.children],
  );

  const takenCount = useMemo(
    () => child?.lessons.filter((lesson) => lesson.status === "TAK").length ?? 0,
    [child],
  );

  const hidden = state.hiddenFreeSlotsByParent[parentId] ?? [];
  const freeSlots = state.freeSlots.filter(
    (slot) =>
      slot.status === "OPEN" &&
      slot.sourceChildId !== parentId &&
      !hidden.includes(slot.id),
  );

  if (!child) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold">Nie znaleziono rodzica</h1>
          <p className="mt-2 text-sm text-slate-600">Podaj poprawny identyfikator dziecka.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {state.children.slice(0, 8).map((sample) => (
              <Link
                key={sample.id}
                href={`/rodzic/${sample.id}`}
                className="rounded-full border border-slate-200 px-3 py-1 text-slate-700"
              >
                {sample.firstName}
              </Link>
            ))}
          </div>
          <Link
            href="/instruktor"
            className="mt-6 inline-block rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Przejdz do widoku instruktora
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md px-4 py-6">
        <header className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Panel rodzica</p>
          <h1 className="mt-1 text-2xl font-semibold">{child.firstName}</h1>
          <div className="mt-3 space-y-1 text-sm text-slate-600">
            <p>Nr dziecka: {child.number}</p>
            <p>
              Grupa: {child.groupName} ({child.age} lat)
            </p>
            <p>Instruktor: {child.instructor}</p>
            <p>
              Zajecia TAK: <span className="font-semibold">{takenCount}/15</span>
            </p>
          </div>
          <div className="mt-4 flex gap-2 text-xs">
            <Link href="/instruktor" className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              Widok instruktora
            </Link>
            <Link href="/" className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              Lista testowa
            </Link>
          </div>
        </header>

        {notice ? (
          <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            {notice}
          </div>
        ) : null}

        <section className="mb-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Wolne miejsca</h2>
            <span className="text-sm text-slate-500">{freeSlots.length} dostepnych</span>
          </div>

          {freeSlots.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Brak wolnych miejsc dla tej grupy testowej.
            </p>
          ) : (
            <div className="space-y-3">
              {freeSlots.map((slot) => (
                <div key={slot.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Z grupy: {slot.groupName}</p>
                      <p className="font-medium">
                        {slot.day}, {formatDate(slot.dateISO)}
                      </p>
                      <p className="text-sm text-slate-600">Godzina: {slot.time}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const result = actions.takeFreeSlot(child.id, slot.id);
                          setNotice(result.ok ? "Miejsce zostalo przypisane do dziecka." : result.message ?? "Nie udalo sie przejac miejsca.");
                        }}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
                      >
                        TAK
                      </button>
                      <button
                        onClick={() => {
                          actions.dismissFreeSlot(child.id, slot.id);
                          setNotice("Komunikat zostal ukryty tylko dla tego rodzica.");
                        }}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        ANULUJ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Zajecia 1-15</h2>
            <span className="text-sm text-slate-500">Kliknij NIE, aby zwolnic miejsce</span>
          </div>

          <div className="space-y-3">
            {child.lessons
              .slice()
              .sort((a, b) => a.nr - b.nr)
              .map((lesson) => (
                <div key={lesson.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Zajecia {lesson.nr}</p>
                      <p className="font-medium">
                        {lesson.day}, {formatDate(lesson.dateISO)}
                      </p>
                      <p className="text-sm text-slate-600">Godzina: {lesson.time}</p>
                    </div>

                    <div className="flex gap-2">
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          lesson.status === "TAK"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        TAK
                      </span>
                      <button
                        onClick={() => {
                          const result = actions.cancelLesson(child.id, lesson.id);
                          setNotice(result.ok ? "Zajecia oznaczone jako NIE. Powstalo wolne miejsce." : result.message ?? "Nie udalo sie zapisac zmiany.");
                        }}
                        disabled={lesson.status === "NIE"}
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          lesson.status === "NIE"
                            ? "cursor-not-allowed bg-rose-100 text-rose-400"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        NIE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
