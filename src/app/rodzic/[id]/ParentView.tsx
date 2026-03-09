"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AcceptButton, CancelButton, GhostButton, IslandCard } from "@/components/ui";
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

  const hidden = state.hiddenFreeSlotsByParent[parentId] ?? [];
  const freeSlots = state.freeSlots.filter(
    (slot) => slot.status === "OPEN" && slot.sourceChildId !== parentId && !hidden.includes(slot.id),
  );

  const constantHours = useMemo(() => {
    if (!child) return [];
    const map = new Map<string, { day: string; time: string; group: string }>();

    child.lessons.forEach((lesson) => {
      const key = `${lesson.day}-${lesson.time}`;
      if (!map.has(key)) {
        map.set(key, { day: lesson.day, time: lesson.time, group: child.groupName });
      }
    });

    return [...map.values()].slice(0, 2);
  }, [child]);

  const nearestLesson = useMemo(() => {
    if (!child) return null;

    return child.lessons
      .filter((lesson) => lesson.status === "TAK")
      .slice()
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))[0];
  }, [child]);

  const chat = useMemo(() => {
    return state.parentMessages
      .filter((message) => message.childId === parentId)
      .slice()
      .sort((a, b) => a.createdAtISO.localeCompare(b.createdAtISO));
  }, [parentId, state.parentMessages]);

  if (!child) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <IslandCard>
            <h1 className="text-xl font-semibold">Nie znaleziono panelu rodzica</h1>
            <p className="mt-2 text-sm text-gray-500">Podaj poprawny identyfikator dziecka.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {state.children.slice(0, 8).map((sample) => (
                <Link
                  key={sample.id}
                  href={`/rodzic/${sample.id}`}
                  className="rounded-full border border-[#e6e8ec] px-3 py-1"
                >
                  {sample.fullName}
                </Link>
              ))}
            </div>
          </IslandCard>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-[#1f2937]">
      <div className="mx-auto max-w-md space-y-4 px-4 py-6">
        <IslandCard>
          <p className="text-sm text-gray-500">Panel rodzica</p>
          <h1 className="mt-1 text-2xl font-semibold">{child.fullName}</h1>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>Nr dziecka: {child.number}</p>
            <p>Grupa: {child.groupName}</p>
            <p>Instruktor: {child.instructor}</p>
          </div>
          <div className="mt-4 flex gap-2 text-xs">
            <Link href="/instruktor" className="ghost-button">
              Widok instruktora
            </Link>
            <Link href="/" className="ghost-button">
              Lista testowa
            </Link>
          </div>
        </IslandCard>

        {notice ? (
          <div className="rounded-2xl border border-[#e6e8ec] bg-white px-4 py-3 text-sm text-gray-600">{notice}</div>
        ) : null}

        <IslandCard>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Zwolnione miejsce</h2>
            <span className="text-sm text-gray-500">{freeSlots.length}</span>
          </div>

          {freeSlots.length === 0 ? (
            <p className="rounded-2xl border border-[#e6e8ec] bg-[#f7f8fa] px-4 py-3 text-sm text-gray-500">
              Brak wolnych miejsc.
            </p>
          ) : (
            <div className="space-y-3">
              {freeSlots.map((slot) => (
                <div key={slot.id} className="rounded-2xl border border-[#e6e8ec] p-4">
                  <p className="text-sm text-gray-500">Grupa: {slot.groupName}</p>
                  <p className="mt-1 font-medium">Data: {formatDate(slot.dateISO)}</p>
                  <p className="text-sm text-gray-600">Godzina: {slot.time}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <AcceptButton
                      onClick={() => {
                        const result = actions.takeFreeSlot(child.id, slot.id);
                        setNotice(result.ok ? "Przypisano wolne miejsce do dziecka." : result.message ?? "Nie udalo sie przejac miejsca.");
                      }}
                    />
                    <GhostButton
                      onClick={() => {
                        actions.dismissFreeSlot(child.id, slot.id);
                        setNotice("Komunikat ukryty lokalnie dla tego rodzica.");
                      }}
                    >
                      Anuluj
                    </GhostButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </IslandCard>

        <IslandCard>
          <h2 className="text-lg font-semibold">Stale godziny</h2>
          <div className="mt-3 space-y-2 text-sm">
            {constantHours.map((item) => (
              <div key={`${item.day}-${item.time}`} className="rounded-2xl border border-[#e6e8ec] bg-[#f7f8fa] px-4 py-3">
                <p className="font-medium">{item.day}</p>
                <p>Godzina: {item.time}</p>
                <p className="text-gray-500">Grupa: {item.group}</p>
              </div>
            ))}
          </div>
        </IslandCard>

        <IslandCard>
          <h2 className="text-lg font-semibold">Najblizsze zajecia</h2>
          {nearestLesson ? (
            <div className="mt-3 rounded-2xl border border-[#e6e8ec] bg-[#f7f8fa] px-4 py-3 text-sm">
              {nearestLesson.day}, {formatDate(nearestLesson.dateISO)}, godz. {nearestLesson.time}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Brak zaplanowanych zajec.</p>
          )}
        </IslandCard>

        <IslandCard>
          <h2 className="text-lg font-semibold">Zajecia 1-15</h2>
          <div className="mt-3 space-y-2">
            {child.lessons
              .slice()
              .sort((a, b) => a.nr - b.nr)
              .map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between rounded-2xl border border-[#e6e8ec] px-4 py-3">
                  <div className="text-sm">
                    <p className="font-medium">{lesson.nr}. {formatDate(lesson.dateISO)}</p>
                    <p className="text-gray-500">Godzina: {lesson.time}</p>
                  </div>
                  <CancelButton
                    disabled={lesson.status === "NIE"}
                    onClick={() => {
                      const result = actions.cancelLesson(child.id, lesson.id);
                      setNotice(result.ok ? "Zajecia anulowane i zwolniono miejsce." : result.message ?? "Nie udalo sie anulowac zajec.");
                    }}
                  />
                </div>
              ))}
          </div>
        </IslandCard>

        <IslandCard>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Wiadomosci / uwagi</h2>
            <span className="text-xs text-gray-500">Rodzic ↔ Instruktor</span>
          </div>

          <div className="mt-3 space-y-2">
            {chat.map((message) => (
              <div key={message.id} className="rounded-2xl border border-[#e6e8ec] bg-[#f7f8fa] px-4 py-3 text-sm">
                <p className="mb-1 text-xs font-semibold text-gray-500">{message.author === "RODZIC" ? "Rodzic" : "Instruktor"}</p>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
        </IslandCard>
      </div>
    </main>
  );
}
