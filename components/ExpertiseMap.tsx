'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Initials, Dots } from './ui';

export default function ExpertiseMap({ themes }: { themes: { theme: string; people: { id: string; name: string; headline: string; strength: number }[] }[] }) {
  const [sel, setSel] = useState(themes[0]?.theme);
  const cur = themes.find((t) => t.theme === sel);
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 px-4">
        {themes.map((t) => (
          <button key={t.theme} onClick={() => setSel(t.theme)} className={`chip tap !text-[12px] !py-1 ${sel === t.theme ? 'bg-net text-card' : 'net-chip'}`}>
            {t.theme} <span className="opacity-70 num">{t.people.length}</span>
          </button>
        ))}
      </div>
      {cur && (
        <ul className="mx-4 mt-3 rounded-2xl border hair bg-card divide-y divide-line">
          {cur.people.map((p) => (
            <li key={p.id}><Link href={`/person/${p.id}`} className="flex items-center gap-3 px-3.5 py-2.5 tap">
              <Initials name={p.name} net size={30} />
              <div className="min-w-0 flex-1"><div className="text-[13.5px] font-semibold">{p.name}</div><div className="text-[12px] text-muted truncate">{p.headline}</div></div>
              <Dots n={p.strength} />
            </Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}
