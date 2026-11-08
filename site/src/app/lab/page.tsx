import type { Metadata } from "next";
import { Suspense } from "react";
import { LabScreen } from "./lab-screen";
import { assetPath, characters } from "@/lib/catalog";
import type { ShapeOption } from "@/components/course-lab";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Change the layer health and see which formula finishes in fewer bounces.",
};

export default function LabPage() {
  const shapes: ShapeOption[] = characters.map((character) => ({
    id: character.id,
    name: character.name,
    formula: character.formula,
    color: character.color,
    accent: character.accent,
    stick: assetPath(character.images.stick),
    family: character.family,
  }));

  return (
    <div className="grid gap-8">
      <div className="grid max-w-2xl gap-3">
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">The course dial</h1>
        <p className="leading-7 text-muted-foreground">
          The menu is the full roster. A line is drawn when the body hit is a
          bounce rule: a formula, the plain +1 ramp, a percent of the layer,
          or a fixed number of contacts. When it is not, the dial shows the
          rule that decides that fighter: a fuse, a projectile, a seeded roll,
          a mode, or a last-team win. Move the health. The lead is allowed
          to change.
        </p>
      </div>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading the dial.</p>
        }
      >
        <LabScreen shapes={shapes} />
      </Suspense>
    </div>
  );
}
