import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { readPair } from "@/lib/barrier";
import { shapeCharacter } from "@/lib/catalog";
import { COURSES, courseById, totalHealth } from "@/lib/courses";
import { formatHealth } from "@/lib/format";

type Params = { course: string };

const LEFT = "x-squared" as const;
const RIGHT = "fibonacci" as const;

export const instant = false;

export function generateStaticParams(): Params[] {
  return COURSES.map((course) => ({ course: course.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { course: id } = await params;
  const course = courseById(id);
  return { title: course?.name ?? "Race" };
}

export default async function RacePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { course: id } = await params;
  const course = courseById(id);
  if (!course) notFound();
  const left = shapeCharacter(LEFT);
  const right = shapeCharacter(RIGHT);
  const reading = readPair(LEFT, RIGHT, course.layers);
  const winner =
    reading.outcome === "a"
      ? left.name
      : reading.outcome === "b"
        ? right.name
        : reading.outcome === "tie"
          ? "They tie"
          : "Open";

  return (
    <article className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,1fr)]">
      <div className="grid gap-4">
        <p className="text-sm text-muted-foreground">{course.slot}</p>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">{course.name}</h1>
        <p className="max-w-xl leading-7">{course.summary}</p>
        <p className="max-w-xl leading-7 text-muted-foreground">
          In Orb Race the opponent&apos;s remaining health does not decide it.
          The first team through every one of its own layers wins. On this
          course the barrier model gives {left.name}{" "}
          {reading.a == null ? "a fuse" : `${formatHealth(reading.a)} bounces`}{" "}
          and {right.name}{" "}
          {reading.b == null ? "a fuse" : `${formatHealth(reading.b)} bounces`}.{" "}
          {winner === "They tie" || winner === "Open"
            ? winner
            : `${winner} finishes first`}{" "}
          if both bounce at the same rate. That is a prediction, not an upload.
        </p>
        <p>
          <Link
            href="/lab"
            className="text-sm underline underline-offset-4"
          >
            Move this pair on the dial
          </Link>
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Setup</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Mode</TableCell>
            <TableCell>Orb Race</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Layers</TableCell>
            <TableCell className="font-mono">{course.layers.length}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Health</TableCell>
            <TableCell className="font-mono">
              {formatHealth(totalHealth(course.layers))}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Win</TableCell>
            <TableCell>First team through every layer</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Reading</TableCell>
            <TableCell>
              {left.name} vs {right.name}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </article>
  );
}
