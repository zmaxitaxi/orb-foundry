"use client";

import { useState } from "react";
import Link from "next/link";
import { FighterAvatar } from "@/components/fighter-avatar";
import { Button } from "@/components/ui/button";
import { FAMILIES } from "@/lib/catalog";

export type CharacterRow = {
  id: string;
  name: string;
  formula: string;
  stick: string;
  family: string;
  mode: string;
};

export function CharacterIndex({ rows }: { rows: CharacterRow[] }) {
  const [family, setFamily] = useState<string>("all");
  const visible =
    family === "all" ? rows : rows.filter((row) => row.family === family);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        {FAMILIES.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={family === item.id ? "default" : "outline"}
            onClick={() => setFamily(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {visible.length} fighters
      </p>
      <ul className="border-y border-border">
        {visible.map((row) => (
          <li key={row.id} className="border-b border-border last:border-b-0">
            <Link
              href={`/characters/${row.id}`}
              className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-x-4 gap-y-0.5 py-2 hover:bg-muted/60 sm:grid-cols-[4rem_minmax(0,11rem)_minmax(0,1fr)]"
            >
              <FighterAvatar
                src={row.stick}
                className="row-span-2 sm:row-span-1"
              />
              <span className="self-end leading-tight sm:self-center">{row.name}</span>
              <span className="col-start-2 self-start font-mono text-xs leading-5 break-words text-muted-foreground sm:col-start-3 sm:self-center">
                {row.formula}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
