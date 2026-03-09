"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GhostButton, IslandCard } from "@/components/ui";
import { useMvpStore } from "@/lib/use-mvp-store";

function formatDate(dateISO: string): string {
  const [year, month, day] = dateISO.split("-");
  return `${day}.${month}.${year}`;
}

export default function InstructorPage() {
  const { state, actions } = useMvpStore();
  const [info, setInfo] = useState<string>("");

  const groups = useMemo(() => {
    const map = new Map<string, { groupId: string; name: string; age: number; count: number; freeSlots: number }>();

    state.children.forEach((child) => {
      const freeSlotsCount = state.freeSlots.filter(
        (slot) => slot.status === "OPEN" && slot.groupName === child.groupName,
      ).length;

      const existing = map.get(child.groupId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(child.groupId, {
          groupId: child.groupId,
          name: child.groupName,
          age: child.age,
          count: 1,
          freeSlots: freeSlotsCount,
        });
      }
    });

    return [...map.values()].sort((a, b) => a.age - b.age);
  }, [state.children, state.freeSlots]);

  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.groupId ?? "g6");

  const activeGroup = groups.find((group) => group.groupId === selectedGroupId) ?? groups[0];

  const childrenInGroup = useMemo(() => {
    if (!activeGroup) return [];

    return state.children
      .filter((child) => child.groupId === activeGroup.groupId)
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [activeGroup, state.children]);

  const groupMessages = useMemo(() => {
    const childIds = new Set(childrenInGroup.map((child) => child.id));

    return state.parentMessages
      .filter((message) => message.author === "RODZIC" && childIds.has(message.childId))
      .slice()
      .sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO));
  }, [childrenInGroup, state.parentMessages]);

  const nearestLessons = useMemo(() => {
    if (!activeGroup) return [];
    const plan = state.groupPlans[activeGroup.groupId] ?? [];
    const referenceChild = childrenInGroup[0];
    if (!referenceChild) return [];

    return referenceChild.lessons.slice(0, 5).map((lesson) => {
      const item = plan.find((entry) => entry.nr === lesson.nr);
      return {
        lesson,
        topic: item?.topic ?? "Zajecia techniczne",
        recommendations: item?.recommendations ?? "Prosimy o spokojna rozgrzewke.",
      };
    });
  }, [activeGroup, childrenInGroup, state.groupPlans]);

  const planRows = activeGroup ? state.groupPlans[activeGroup.groupId] ?? [] : [];

  return (
    <main className="min-h-screen text-[#1f2937]">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <IslandCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Panel instruktora</p>
              <h1 className="mt-1 text-2xl font-semibold">Podglad grup i komunikacji</h1>
            </div>
            <div className="flex gap-2">
              <GhostButton onClick={() => actions.resetStore()}>Reset danych testowych</GhostButton>
              <Link href="/" className="ghost-button">
                Lista rodzicow
              </Link>
            </div>
          </div>
          {info ? <p className="mt-2 text-sm text-gray-500">{info}</p> : null}
        </IslandCard>

        <IslandCard>
          <h2 className="text-lg font-semibold">Panel grupy</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {groups.map((group) => (
              <button
                key={group.groupId}
                type="button"
                onClick={() => setSelectedGroupId(group.groupId)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  selectedGroupId === group.groupId
                    ? "border-[#e6e8ec] bg-white"
                    : "border-[#e6e8ec] bg-[#f7f8fa]"
                }`}
              >
                {group.age} lat - {group.name}
              </button>
            ))}
          </div>

          {activeGroup ? (
            <div className="mt-4 rounded-2xl border border-[#e6e8ec] bg-[#f7f8fa] px-4 py-3 text-sm">
              <p>Nazwa grupy: {activeGroup.name}</p>
              <p>Wiek: {activeGroup.age} lat</p>
              <p>Liczba dzieci: {activeGroup.count}</p>
              <p>Liczba wolnych miejsc: {activeGroup.freeSlots}</p>
            </div>
          ) : null}
        </IslandCard>

        <IslandCard>
          <h2 className="text-lg font-semibold">Dzieci w grupie</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {childrenInGroup.map((child) => {
              const hasParentMessage = state.parentMessages.some(
                (message) =>
                  message.childId === child.id &&
                  message.author === "RODZIC" &&
                  message.unreadForInstructor,
              );
              const progress = child.lessons.filter((lesson) => lesson.status === "TAK").length;

              return (
                <div key={child.id} className="rounded-2xl border border-[#e6e8ec] bg-[#f7f8fa] p-4 text-sm">
                  <p className="font-semibold">{child.fullName}</p>
                  <p className="text-gray-500">ID dziecka: {child.id}</p>
                  <p className="mt-1">Postep zajec: {progress}/15</p>
                  {hasParentMessage ? (
                    <span className="mt-2 inline-block rounded-full border border-[#e6e8ec] bg-white px-2 py-1 text-xs">
                      Wiadomosc od rodzica
                    </span>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <GhostButton
                      onClick={() => setInfo(`Odpowiedz dla ${child.fullName} jest dostepna w sekcji wiadomosci.`)}
                    >
                      Odpowiedz
                    </GhostButton>
                    <Link href={`/rodzic/${child.id}`} className="ghost-button">
                      Otworz panel
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </IslandCard>

        <IslandCard>
          <h2 className="text-lg font-semibold">Najblizsze zajecia</h2>
          <div className="mt-3 space-y-2">
            {nearestLessons.map((item) => (
              <div key={item.lesson.id} className="rounded-2xl border border-[#e6e8ec] bg-[#f7f8fa] px-4 py-3 text-sm">
                <p className="font-medium">
                  {formatDate(item.lesson.dateISO)} | {item.lesson.time}
                </p>
                <p>Temat: {item.topic}</p>
                <p className="text-gray-500">Zalecenia: {item.recommendations}</p>
              </div>
            ))}
          </div>
        </IslandCard>

        <IslandCard>
          <h2 className="text-lg font-semibold">Plan 15 zajec</h2>
          <div className="mt-3 space-y-2">
            {planRows.map((row) => {
              const lesson = childrenInGroup[0]?.lessons.find((entry) => entry.nr === row.nr);
              return (
                <div key={row.nr} className="flex items-center justify-between rounded-2xl border border-[#e6e8ec] px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {row.nr}. {lesson ? formatDate(lesson.dateISO) : "--.--.----"} {lesson ? `| ${lesson.time}` : ""}
                    </p>
                    <p className="text-gray-600">Temat: {row.topic}</p>
                  </div>
                  <GhostButton onClick={() => setInfo(`Tryb edycji dla zajec ${row.nr} jest gotowy do wdrozenia.`)}>
                    Edytuj
                  </GhostButton>
                </div>
              );
            })}
          </div>
        </IslandCard>

        <IslandCard>
          <h2 className="text-lg font-semibold">Wiadomosci od rodzicow</h2>
          <div className="mt-3 space-y-2">
            {groupMessages.map((message) => {
              const child = state.children.find((item) => item.id === message.childId);
              return (
                <div key={message.id} className="flex items-start justify-between gap-3 rounded-2xl border border-[#e6e8ec] bg-[#f7f8fa] px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{child?.fullName ?? message.childId}</p>
                    <p className="text-gray-600">{message.text}</p>
                  </div>
                  <GhostButton
                    onClick={() => setInfo(`Przygotowano odpowiedz dla ${child?.fullName ?? message.childId}.`)}
                  >
                    Odpowiedz
                  </GhostButton>
                </div>
              );
            })}
            {groupMessages.length === 0 ? <p className="text-sm text-gray-500">Brak wiadomosci od rodzicow.</p> : null}
          </div>
        </IslandCard>
      </div>
    </main>
  );
}
