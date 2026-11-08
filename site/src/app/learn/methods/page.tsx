import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methods",
  description:
    "The timestep, the seed, and what the barrier reading does and does not claim.",
};

export default function MethodsPage() {
  return (
    <article className="grid max-w-2xl gap-6">
      <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Methods</h1>
      <p className="leading-7">
        The arena steps at 1/120 of a second. Random draws come from a seed.
        The same seed and the same course produce the same race. Theme,
        camera, the recording frame rate, and the announcer do not change who
        wins.
      </p>
      <p className="leading-7">
        The lab is a barrier sum. It adds each bounce&apos;s damage until the
        sum passes the health of the layers, and it gives both fighters the
        same contact rate. Infinity removes a layer in one contact, so its
        bounce count is the number of layers. Centy removes a percent of the
        current layer&apos;s maximum, starting at 1% and gaining 0.1% after
        each bounce. Hydrogen Bomb is a 60-second fuse, so the sum does not
        name a winner against it.
      </p>
      <p className="leading-7">
        Travel speed, extra projectiles, and the path of the orb are in the
        arena and outside this sum. The number on the lab is the prediction.
        A seeded run is the check, and this site does not run the arena yet.
      </p>
      <p>
        <Link href="/lab" className="text-sm underline underline-offset-4">
          Back to the dial
        </Link>
        <span className="text-muted-foreground"> · </span>
        <Link href="/learn/models" className="text-sm underline underline-offset-4">
          The models
        </Link>
      </p>
    </article>
  );
}
