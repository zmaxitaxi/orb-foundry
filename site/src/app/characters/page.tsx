import type { Metadata } from "next";
import { CharacterIndex, type CharacterRow } from "@/components/character-index";
import { assetPath, characters } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Characters",
  description: "The roster, with the damage rule beside each fighter.",
};

export default function CharactersPage() {
  const rows: CharacterRow[] = characters.map((character) => ({
    id: character.id,
    name: character.name,
    formula: character.formula,
    stick: assetPath(character.images.stick),
    family: character.family,
    mode: character.mode,
  }));

  return (
    <div className="grid gap-8">
      <div className="grid max-w-2xl gap-3">
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Characters</h1>
        <p className="leading-7 text-muted-foreground">
          One fighter, one formula. The picture is the sticker for that fighter.
          The lab studies six of these shapes against the length of the course.
        </p>
      </div>
      <CharacterIndex rows={rows} />
    </div>
  );
}
