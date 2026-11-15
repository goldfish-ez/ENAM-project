'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Today', match: (p: string) => p === '/', icon: (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6h16M4 12h10M4 18h6" strokeLinecap="round" /></svg>) },
  { href: '/ask', label: 'Ask', match: (p: string) => p.startsWith('/ask') || p.startsWith('/company'), icon: (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>) },
  { href: '/network', label: 'Network', match: (p: string) => p.startsWith('/network') || p.startsWith('/person'), icon: (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="2.2" /><circle cx="5" cy="6" r="1.6" /><circle cx="19" cy="7" r="1.6" /><circle cx="18" cy="18" r="1.6" /><circle cx="6" cy="18" r="1.6" /><path d="M10.3 10.6 6.2 7.2M13.8 10.9l3.8-2.8M13.6 13.6l3.3 3.3M10.4 13.5l-3.3 3.4" /></svg>) },
];

export default function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto max-w-[480px] px-4 pb-3 pointer-events-auto">
        <div className="flex items-center justify-around rounded-2xl border hair bg-card/90 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,.25)] py-1.5">
          {tabs.map((t) => {
            const on = t.match(path);
            return (
              <Link key={t.href} href={t.href} className={`tap flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl text-[11px] ${on ? 'text-ink' : 'text-muted'}`}>
                {t.icon}
                <span className={on ? 'font-semibold' : ''}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
