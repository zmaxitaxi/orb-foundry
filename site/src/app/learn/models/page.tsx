import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Models",
  description:
    "The questions behind the dial: a barrier sum, a phase chart, a fuse, and a ranking that depends on the course.",
};

const MODELS = [
  {
    name: "Barrier crossing",
    question: "How much health can this formula clear, and in how many bounces?",
    body: "Add each bounce’s damage until the sum passes the layers. Compare that count for two fighters at the same contact rate. The sentence on the dial is this sum.",
    href: "/lab",
    link: "Open the dial",
  },
  {
    name: "Phase change",
    question: "Where does the winner flip?",
    body: "Sweep one layer from a small health to a huge one and mark the boundary. The chart on the dial is that sweep. The vertical rule is the health you are reading.",
    href: "/lab",
    link: "See the chart",
  },
  {
    name: "Designed experiment",
    question: "Which factor actually changes the finisher?",
    body: "The published-course table holds the pair fixed and changes the course: layer count and layer health. A later study can move the time limit and the seed on their own, then together, and report the interaction.",
    href: "/races",
    link: "The courses",
  },
  {
    name: "Conditional comparison",
    question: "Who is ahead on this course?",
    body: "The finisher is a fact about a course length. When the table names a different fighter on a short course and a long one, those are two comparisons. One ranking fitted to every course at once mixes the two regimes. Showing that mixture fail is the lesson.",
    href: "/lab",
    link: "Compare a pair",
  },
  {
    name: "Survival and competing risks",
    question: "Did the climber finish, or did a fuse end the race?",
    body: "Hydrogen Bomb waits 60 seconds, then sets every layer to 0. That is a deadline, and the barrier sum leaves the winner open because a bounce count is not a clock. A later chart can plot who is still on the course at each second.",
    href: "/characters/hydrogen-bomb",
    link: "Hydrogen Bomb",
  },
  {
    name: "Continuous approximation",
    question: "Can a smooth curve stand in for the bounce-by-bounce sum?",
    body: "Treat contacts as a rate, integrate the damage, and lay the curve on a seeded run. The dial still uses the discrete sum. The curve, and the run it has to match, are the next check.",
    href: "/learn/methods",
    link: "Methods",
  },
  {
    name: "Interaction model",
    question: "How much does course length change the odds?",
    body: "Predict the winner from the growth of the formula, the health of the course, and the product of the two. The product is the lesson: a slam can lead on a small course and fall behind when the course grows. The dial shows that crossing. A fitted equation is still ahead.",
    href: "/lab",
    link: "Move the health",
  },
  {
    name: "Absorbing chain",
    question: "Which layer are they on, and when do they finish?",
    body: "The state is the layer index. Finished is the state you do not leave. The rate out of a layer is that layer’s health against the damage rule. The barrier sum skips the path and counts the bounces to absorption. The chain would show the time spent on each layer.",
    href: "/learn/methods",
    link: "What the sum claims",
  },
];

export default function ModelsPage() {
  return (
    <article className="grid max-w-2xl gap-10">
      <div className="grid gap-3">
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Models</h1>
        <p className="leading-7 text-muted-foreground">
          Each model answers a different question. The dial already answers
          two of them: how many bounces clear the health, and where that
          lead changes. The others are named here so a later study has a
          place to land.
        </p>
      </div>
      <ol className="grid gap-8">
        {MODELS.map((model, index) => (
          <li key={model.name} className="grid gap-2 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">0{index + 1}</p>
            <h2 className="font-serif text-2xl tracking-tight">{model.name}</h2>
            <p className="leading-7">{model.question}</p>
            <p className="leading-7 text-muted-foreground">{model.body}</p>
            <Link href={model.href} className="text-sm underline underline-offset-4">
              {model.link}
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
