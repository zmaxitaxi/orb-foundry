import Link from "next/link";
import { CourseSetupTable } from "@/components/course-setup-table";
import { firstFlipHealth, readPair } from "@/lib/barrier";
import { shapeCharacter } from "@/lib/catalog";
import { COURSES, totalHealth } from "@/lib/courses";
import { formatHealth, formatLayers } from "@/lib/format";

const LEFT = "x-squared" as const;
const RIGHT = "fibonacci" as const;

export default function HomePage() {
  const left = shapeCharacter(LEFT);
  const right = shapeCharacter(RIGHT);
  const flip = firstFlipHealth(LEFT, RIGHT);
  const short = COURSES[0];
  const shortReading = readPair(LEFT, RIGHT, short.layers);

  return (
    <div className="grid gap-14">
      <div className="grid max-w-2xl gap-4">
        <p className="text-sm text-muted-foreground">The lab</p>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl text-balance">
          The course changes the winner
        </h1>
        <p className="text-lg leading-8">
          Hold two fighters fixed and change the health they have to clear.
          The same formulas trade the lead. YouTube plays the race. This
          page keeps the reason.
        </p>
      </div>

      <section className="grid gap-4 border-y border-border py-8">
        <h2 className="font-serif text-2xl tracking-tight text-balance sm:text-3xl">
          {left.name} and {right.name}
          {flip
            ? ` trade the lead at ${formatHealth(flip)} health`
            : " stay in one order across this range"}
        </h2>
        <p className="max-w-2xl leading-7 text-muted-foreground">
          {left.name} hits with n². {right.name} hits with the nth Fibonacci
          number. On the short course ({formatLayers(short.layers)},{" "}
          {formatHealth(totalHealth(short.layers))} health in all),{" "}
          {shortReading.outcome === "b" ? right.name : left.name} needs fewer
          bounces. The count is a barrier sum at an equal contact rate, not a
          recorded upload.
        </p>
        <p>
          <Link href="/lab" className="text-sm underline underline-offset-4">
            Move the dial
          </Link>
        </p>
      </section>

      <section className="grid gap-4">
        <h2 className="font-serif text-2xl tracking-tight">
          Courses the channel runs
        </h2>
        <CourseSetupTable caption="Setups from the publisher. Winners from the channel will be listed when an upload archive is connected." />
      </section>
    </div>
  );
}
