"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { Briefing } from "@/lib/briefings";

const TABS = [
  { id: "what", label: "What it is" },
  { id: "characteristic", label: "Characteristic" },
  { id: "matters", label: "Why it matters" },
  { id: "sources", label: "Sources" },
] as const;

export function CharacterDossier({ briefing }: { briefing: Briefing }) {
  return (
    <Tabs defaultValue="what" className="w-full">
      <TabsList
        variant="line"
        className="h-auto w-full flex-wrap justify-start gap-x-1"
      >
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="px-2.5 py-2 font-mono text-xs tracking-wide uppercase"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="what" className="pt-4 leading-7">
        {briefing.what}
      </TabsContent>
      <TabsContent value="characteristic" className="pt-4 leading-7">
        {briefing.characteristic}
      </TabsContent>
      <TabsContent value="matters" className="pt-4 leading-7">
        {briefing.matters}
      </TabsContent>
      <TabsContent value="sources" className="pt-4">
        <ul className="grid gap-2">
          {briefing.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}
