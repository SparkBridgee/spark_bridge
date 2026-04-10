"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { LogoutButton } from "@/features/auth-logout/ui/logout-button";
import { ThemeToggle } from "@/features/theme-toggle/ui/theme-toggle";
import { useAuthStore } from "@/entities/session/model/auth-store";

const NAV = [
  { href: "/search", label: "검색" },
  { href: "/saved", label: "저장됨" },
];

export function Header() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/search"
            className="text-base font-bold tracking-tight sm:text-lg"
          >
            Spark Bridge
          </Link>
          <nav className="flex gap-0.5 sm:gap-1">
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {user && (
            <span className="hidden max-w-[160px] truncate text-xs text-muted-foreground md:inline">
              {user.email}
            </span>
          )}
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
