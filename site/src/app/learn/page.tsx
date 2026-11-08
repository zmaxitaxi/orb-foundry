import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Layers, bounces, the two ways to win, and the models behind the dial.",
};

const LESSONS = [
  {
    href: "/learn/methods",
    title: "Layers",
    body: "A race is a stack of health. Clearing your own stack wins. The other team's remaining health does not.",
  },
  {
    href: "/lab",
    title: "The bounce",
    body: "n counts contacts. Slammy hits for 1 + 2n. X² hits for n². Fibonacci hits with the nth Fibonacci number. Math damage caps at 1×10²¹.",
  },
  {
    href: "/characters",
    title: "Two wins",
    body: "Orb Race finishes the course. Classic is the last living team. The same names can mean a different winner.",
  },
  {
    href: "/characters/hydrogen-bomb",
    title: "Waiting",
    body: "Hydrogen Bomb does nothing until 60 seconds, then every layer goes to 0. Professor's body stays at 0 until a formula is copied.",
  },
  {
    href: "/learn/models",
    title: "Models",
    body: "A barrier sum, a phase chart, a fuse as a deadline, and a ranking that mixes a short course with a long one. Each model asks a different question.",
  },
];

export default function LearnPage() {
  return (
    <div className="grid max-w-2xl gap-10">
      <div className="grid gap-3">
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Learn</h1>
        <p className="leading-7 text-muted-foreground">
          The short lessons sit beside the models the dial is built from.
          The lab is where the course length makes them visible.
        </p>
      </div>
      <ol className="grid gap-8">
        {LESSONS.map((lesson, index) => (
          <li key={lesson.title} className="grid gap-2 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">0{index + 1}</p>
            <h2 className="font-serif text-2xl tracking-tight">{lesson.title}</h2>
            <p className="leading-7">{lesson.body}</p>
            <Link href={lesson.href} className="text-sm underline underline-offset-4">
              Open
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
