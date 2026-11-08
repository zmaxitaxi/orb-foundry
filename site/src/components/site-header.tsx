"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CHANNEL_URL, characterById } from "@/lib/catalog";
import { courseById } from "@/lib/courses";

type Crumb = { href: string; label: string };

function crumbsFor(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [];
  const crumbs: Crumb[] = [{ href: "/", label: "Home" }];
  if (parts[0] === "characters") {
    crumbs.push({ href: "/characters", label: "Characters" });
    if (parts[1]) {
      const id = decodeURIComponent(parts[1]);
      crumbs.push({
        href: `/characters/${parts[1]}`,
        label: characterById(id)?.name ?? id,
      });
    }
  } else if (parts[0] === "races") {
    crumbs.push({ href: "/races", label: "Races" });
    if (parts[1]) {
      const id = decodeURIComponent(parts[1]);
      crumbs.push({
        href: `/races/${parts[1]}`,
        label: courseById(id)?.name ?? id,
      });
    }
  } else if (parts[0] === "learn") {
    crumbs.push({ href: "/learn", label: "Learn" });
    if (parts[1] === "methods") {
      crumbs.push({ href: "/learn/methods", label: "Methods" });
    } else if (parts[1] === "models") {
      crumbs.push({ href: "/learn/models", label: "Models" });
    }
  } else if (parts[0] === "lab") {
    crumbs.push({ href: "/lab", label: "Lab" });
  }
  return crumbs;
}

const LINKS = [
  { href: "/characters", label: "Characters" },
  { href: "/races", label: "Races" },
  { href: "/learn", label: "Learn" },
  { href: "/lab", label: "Lab" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-serif text-lg tracking-tight">
          <img
            src="/channel-logo.jpg"
            alt=""
            width={40}
            height={40}
            className="size-9 rounded-full sm:size-10"
          />
          Orb Battleground
        </Link>
        <nav
          aria-label="Sections"
          className="-mx-4 flex gap-x-4 overflow-x-auto px-4 py-1 text-sm sm:mx-0 sm:ml-auto sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0"
        >
          {LINKS.map((link) => {
            const active = pathname === link.href;
            const inSection =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  inSection
                    ? "shrink-0 py-2 text-foreground"
                    : "shrink-0 py-2 text-muted-foreground hover:text-foreground"
                }
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={CHANNEL_URL}
            className="shrink-0 py-2 font-medium text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            Watch
          </a>
        </nav>
      </div>
      {crumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="border-t border-border">
          <ol className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-sm text-muted-foreground sm:px-6">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return (
                <li key={crumb.href} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {last ? (
                    <span className="text-foreground" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-foreground">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}
    </header>
  );
}
