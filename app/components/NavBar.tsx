"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Chat" },
  { href: "/dashboard", label: "Analytics" },
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-rose/30 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-rose-deep text-cream glow">
            ✦
          </span>
          <span className="font-semibold tracking-tight">
            Pixi <span className="text-rose-deep">Glow</span> Assistant
          </span>
        </Link>
        <nav className="flex items-center gap-1 rounded-full bg-blush/60 p-1">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-rose-deep text-cream glow"
                    : "text-rose-deep/80 hover:bg-blush"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
