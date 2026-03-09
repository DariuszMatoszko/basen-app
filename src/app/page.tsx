"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChildRecord } from "@/lib/mvp-types";
import { useMvpStore } from "@/lib/use-mvp-store";

export default function Home() {
  const { state } = useMvpStore();

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; children: ChildRecord[] }>();

    state.children.forEach((child) => {
      const key = `${child.age}-${child.groupName}`;
      const label = `${child.age} lat - ${child.groupName}`;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, { label, children: [child] });
        return;
      }

      existing.children.push(child);
    });

    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [state.children]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Basen1-app</p>
          <h1 className="mt-1 text-2xl font-semibold">Lokalny system testowy MVP</h1>
          <p className="mt-2 text-sm text-slate-600">
            Otwieraj wiele kart i testuj scenariusze anulowania oraz przejmowania miejsc.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/instruktor" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              /instruktor
            </Link>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">/rodzic/[id]</span>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold">Szybkie linki do rodzicow</h2>
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-sm font-medium text-slate-600">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/rodzic/${child.id}`}
                      className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      {child.firstName} ({child.number})
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
