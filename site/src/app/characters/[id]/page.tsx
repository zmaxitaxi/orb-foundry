import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterDossier } from "@/components/character-dossier";
import { FighterAvatar } from "@/components/fighter-avatar";
import { briefingFor } from "@/lib/briefings";
import {
  assetPath,
  characterById,
  characters,
  FAMILIES,
  modeCopy,
} from "@/lib/catalog";

type Params = { id: string };

export const instant = false;

export function generateStaticParams(): Params[] {
  return characters.map((character) => ({ id: character.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const character = characterById(id);
  if (!character) return { title: "Character" };
  return {
    title: character.name,
    description: character.formula,
  };
}

export default async function CharacterPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const character = characterById(id);
  if (!character) notFound();
  const modeLabel = character.mode === "orb-race" ? "Orb Race" : "Classic";
  const family =
    FAMILIES.find((item) => item.id === character.family)?.label ??
    character.family;
  const number = String(
    characters.findIndex((item) => item.id === character.id) + 1,
  ).padStart(3, "0");
  const briefing = briefingFor(character.id);

  return (
    <article className="grid items-start gap-10 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="mx-auto w-full max-w-[22rem]">
        <div className="border-[3px] border-foreground bg-[#f4e4c4] p-2 text-foreground shadow-[6px_6px_0_0_#1a120e]">
          <div className="border border-foreground">
            <div
              className="h-2.5 border-b border-foreground"
              style={{ background: character.color }}
            />
            <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-foreground px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
              <span>Orb card</span>
              <span>No. {number}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3 px-3 pt-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              <span>{modeLabel}</span>
              <span>{family}</span>
            </div>
            <div className="flex items-center gap-3 px-3 pt-1 pb-2">
              <h1 className="min-w-0 flex-1 font-serif text-3xl leading-tight tracking-tight break-words sm:text-4xl">
                {character.name}
              </h1>
              <FighterAvatar src={assetPath(character.images.stick)} />
            </div>
            <div className="border-y-[3px] border-foreground bg-[#efe2c6]">
              <img
                src={assetPath(character.images.animated)}
                alt={`${character.name}, with the attack in motion`}
                className="aspect-[3/4] w-full object-contain"
              />
            </div>
            <div className="border-b border-foreground bg-[#fff8ea] px-3 py-2">
              <p className="font-mono text-xs leading-5">{character.formula}</p>
            </div>
            {character.symbol || character.statLabel || character.duplicateEvery ? (
              <dl className="grid grid-cols-2 gap-px bg-foreground text-sm">
                {character.symbol ? (
                  <div className={`bg-[#f4e4c4] px-3 py-1.5 ${character.statLabel ? "" : "col-span-2"}`}>
                    <dt className="font-mono text-[10px] tracking-widest uppercase">Mark</dt>
                    <dd className="font-mono">{character.symbol}</dd>
                  </div>
                ) : null}
                {character.statLabel ? (
                  <div className={`bg-[#f4e4c4] px-3 py-1.5 ${character.symbol ? "" : "col-span-2"}`}>
                    <dt className="font-mono text-[10px] tracking-widest uppercase">Stat</dt>
                    <dd>{character.statLabel}</dd>
                  </div>
                ) : null}
                {character.duplicateEvery ? (
                  <div className="col-span-2 bg-[#f4e4c4] px-3 py-1.5">
                    <dt className="font-mono text-[10px] tracking-widest uppercase">Copies</dt>
                    <dd>Every {character.duplicateEvery} bounces</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            <p className="px-3 py-2 text-sm leading-6">{modeCopy[character.mode]}</p>
            {character.imageLettering ? (
              <p className="border-t border-dashed border-foreground px-3 py-1.5 font-mono text-[10px] tracking-wide uppercase">
                Lettered {character.imageLettering}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        <CharacterDossier briefing={briefing} />
        <p>
          <Link
            href={`/lab?a=${character.id}`}
            className="text-sm underline underline-offset-4"
          >
            Put {character.name} on the course dial
          </Link>
        </p>
        {character.images.portrait ? (
          <figure className="grid max-w-sm gap-2">
            <img
              src={assetPath(character.images.portrait)}
              alt={`${character.name} portrait`}
              className="w-full border-[3px] border-foreground bg-[#f4e4c4]"
            />
            <figcaption className="font-mono text-[10px] tracking-widest uppercase">
              Portrait
            </figcaption>
          </figure>
        ) : null}
      </div>
    </article>
  );
}
