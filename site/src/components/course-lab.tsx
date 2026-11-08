"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContestFigure, OffAxisNote } from "@/components/contest-figure";
import { FighterAvatar } from "@/components/fighter-avatar";
import { FinishChart } from "@/components/finish-chart";
import { healthStops, strokeFor } from "@/lib/barrier";
import { contestFor } from "@/lib/contest";
import {
  clearsByBounces,
  firstCurveFlip,
  isBodyRamp,
  matchReading,
} from "@/lib/curve";
import { FAMILIES } from "@/lib/catalog";
import { COURSES, totalHealth } from "@/lib/courses";
import { formatHealth, formatLayers } from "@/lib/format";

export type ShapeOption = {
  id: string;
  name: string;
  formula: string;
  color: string;
  accent: string;
  stick: string;
  family: ShapeOptionFamily;
};

type ShapeOptionFamily = "math" | "contact" | "special" | "classic";

const SNAPS = [750, 1500, 5000, 32000];
const STOPS = [...new Set([...healthStops(), ...SNAPS])].sort(
  (left, right) => left - right,
);

function nearestIndex(health: number): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  STOPS.forEach((stop, index) => {
    const distance = Math.abs(Math.log(stop) - Math.log(Math.max(1, health)));
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

function countLabel(shape: ShapeOption, layers: number[]): string {
  const value = clearsByBounces(shape.id, layers);
  if (value != null) return formatHealth(value);
  return contestFor(shape.id, shape.family).mark;
}

export function CourseLab({
  shapes,
  initialA = "x-squared",
  initialB = "fibonacci",
  initialHealth = 750,
}: {
  shapes: ShapeOption[];
  initialA?: string;
  initialB?: string;
  initialHealth?: number;
}) {
  const byId = useMemo(
    () => new Map(shapes.map((shape) => [shape.id, shape])),
    [shapes],
  );
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  const [index, setIndex] = useState(() => nearestIndex(initialHealth));
  const health = STOPS[index] ?? STOPS[0];
  const left = byId.get(a);
  const right = byId.get(b);
  if (!left || !right) return null;

  const reading = matchReading(a, b, [health]);
  const pairReady = reading.outcome !== "open";
  const flip = pairReady ? firstCurveFlip(a, b) : null;
  const series = [left, right].flatMap((shape) => {
    const points = STOPS.flatMap((stop) => {
      const bounces = clearsByBounces(shape.id, [stop]);
      return bounces == null ? [] : [{ health: stop, bounces }];
    });
    if (points.length !== STOPS.length) return [];
    return [
      {
        id: shape.id,
        name: shape.name,
        color: strokeFor(shape.color, shape.accent),
        points,
      },
    ];
  });
  const plotted = new Set(series.map((item) => item.id));
  const offAxis = [left, right].filter((shape) => !plotted.has(shape.id));

  return (
    <div className="grid gap-10">
      <div className="grid gap-6 md:grid-cols-2">
        <FighterSelect
          label="Left"
          value={a}
          shapes={shapes}
          onChange={(next) => {
            if (next === b) setB(a);
            setA(next);
          }}
        />
        <FighterSelect
          label="Right"
          value={b}
          shapes={shapes}
          onChange={(next) => {
            if (next === a) setA(b);
            setB(next);
          }}
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-muted-foreground">One layer</p>
          <p className="font-mono text-sm">{formatHealth(health)} health</p>
        </div>
        <Slider
          min={0}
          max={STOPS.length - 1}
          step={1}
          value={[index]}
          aria-label="Layer health"
          onValueChange={(next) => {
            const raw = Array.isArray(next) ? next[0] : next;
            if (typeof raw === "number") setIndex(raw);
          }}
        />
        <div className="flex flex-wrap gap-2">
          {SNAPS.map((snap) => (
            <Button
              key={snap}
              type="button"
              size="sm"
              variant="outline"
              className="min-h-11 px-3"
              onClick={() => setIndex(nearestIndex(snap))}
            >
              {formatHealth(snap)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 border-y border-border py-6">
        <p className="font-serif text-2xl tracking-tight text-balance">
          {pairReady
            ? finishSentence(reading, left.name, right.name, health)
            : openSentence(left, right, health, reading)}
        </p>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {pairReady
            ? `${flipSentence(flip, a, b, left.name, right.name)} `
            : series.length > 0
              ? "The line is the body hit only. The other rule is marked under the chart, off that axis. "
              : "This match has no shared bounce axis, so the cards name each rule. "}
          {series.some((item) => isBodyRamp(item.id))
            ? "A +1 line is the body ramp, 2 then 3 then 4. Copies, speed, and extra contacts sit outside it. "
            : ""}
          {series.length > 0
            ? "The sum uses that hit and the same contact rate for both fighters. "
            : ""}
          Travel speed, projectiles, and the seeded arena stay outside this
          reading.{" "}
          <Link href="/learn/methods" className="underline underline-offset-4">
            Methods
          </Link>
        </p>
      </div>

      {series.length > 0 ? (
        <figure className="grid gap-3">
          <figcaption className="grid gap-1">
            <p className="text-sm font-medium">
              Bounces to clear one layer
            </p>
            <p className="text-sm text-muted-foreground">
              Health is on a log scale. Drag across the chart to move the
              dial. Hover a line to read that health and the bounce count.
              A missing line means that fighter does not clear a layer by a
              bounce-sized hit. Source: the simulator&apos;s body damage,
              equal contact rate.
            </p>
          </figcaption>
          <FinishChart
            series={series}
            markerHealth={health}
            onMarkerHealth={(next) => setIndex(nearestIndex(next))}
          />
          <div className="flex flex-wrap gap-4 text-sm">
            {series.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-2">
                <span
                  className="size-2.5 border border-border"
                  style={{ background: item.color }}
                />
                {item.name}
              </span>
            ))}
          </div>
          {offAxis.map((shape) => (
            <OffAxisNote key={shape.id} fighter={shape} />
          ))}
        </figure>
      ) : (
        <ContestFigure left={left} right={right} />
      )}

      <div className="grid gap-3">
        <h2 className="font-serif text-2xl tracking-tight">
          The same pair on published courses
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {courseSentence(a, b, left.name, right.name)}{" "}
          <Link href="/learn/models" className="underline underline-offset-4">
            The models
          </Link>
        </p>
        <ul className="grid gap-4 md:hidden">
          {COURSES.map((course) => {
            const courseReading = matchReading(a, b, course.layers);
            return (
              <li
                key={course.id}
                className="grid gap-1 border-b border-border pb-4 text-sm"
              >
                <Link
                  href={`/races/${course.id}`}
                  className="underline underline-offset-4"
                >
                  {course.name}
                </Link>
                <p className="text-muted-foreground">{formatLayers(course.layers)}</p>
                <p className="font-mono">
                  {formatHealth(totalHealth(course.layers))} health
                </p>
                <p className="font-mono">
                  {left.name}{" "}
                  {countLabel(left, course.layers)}
                </p>
                <p className="font-mono">
                  {right.name}{" "}
                  {countLabel(right, course.layers)}
                </p>
                <p>
                  Finishes first:{" "}
                  {courseReading.outcome === "open"
                    ? "—"
                    : winnerName(courseReading.outcome, left.name, right.name)}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="text-sm text-muted-foreground md:hidden">
          Bounces at an equal contact rate. A YouTube upload is a different
          record, and this table is not that archive.
        </p>
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Layers</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>{left.name}</TableHead>
              <TableHead>{right.name}</TableHead>
              <TableHead>Finishes first</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {COURSES.map((course) => {
              const courseReading = matchReading(a, b, course.layers);
              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <Link
                      href={`/races/${course.id}`}
                      className="underline underline-offset-4"
                    >
                      {course.name}
                    </Link>
                  </TableCell>
                  <TableCell>{formatLayers(course.layers)}</TableCell>
                  <TableCell className="font-mono">
                    {formatHealth(totalHealth(course.layers))}
                  </TableCell>
                  <TableCell className="font-mono">
                    {countLabel(left, course.layers)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {countLabel(right, course.layers)}
                  </TableCell>
                  <TableCell>
                    {courseReading.outcome === "open"
                      ? "—"
                      : winnerName(courseReading.outcome, left.name, right.name)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableCaption>
            Bounces at an equal contact rate. A YouTube upload is a different
            record, and this table is not that archive.
          </TableCaption>
        </Table>
        </div>
      </div>
    </div>
  );
}

function FighterSelect({
  label,
  value,
  shapes,
  onChange,
}: {
  label: string;
  value: string;
  shapes: ShapeOption[];
  onChange: (id: string) => void;
}) {
  const current = shapes.find((shape) => shape.id === value);
  const groups = FAMILIES.filter((family) => family.id !== "all");
  return (
    <div className="grid justify-items-start gap-3">
      <a
        href={`/characters/${value}`}
        target="_blank"
        rel="noreferrer"
        aria-label={current?.name ?? "Character"}
        className="shrink-0"
      >
        <FighterAvatar src={current?.stick} />
      </a>
      <label className="grid w-full gap-1 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full border border-border bg-background px-2 text-base"
        >
          {groups.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {shapes
                .filter((shape) => shape.family === group.id)
                .map((shape) => (
                  <option key={shape.id} value={shape.id}>
                    {shape.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <p className="font-mono text-xs text-muted-foreground">
        {current?.formula}
      </p>
    </div>
  );
}

function openSentence(
  left: ShapeOption,
  right: ShapeOption,
  health: number,
  reading: ReturnType<typeof matchReading>,
): string {
  const layer = `one layer of ${formatHealth(health)}`;
  const counted = [
    reading.a != null ? `${left.name} clears in ${formatHealth(reading.a)} bounces` : null,
    reading.b != null ? `${right.name} clears in ${formatHealth(reading.b)} bounces` : null,
  ].filter((part) => part != null);
  const open = [left, right].filter((shape) => clearsByBounces(shape.id, [health]) == null);
  if (counted.length === 0) {
    return `On ${layer}, neither side clears by a bounce count.`;
  }
  const marks = open
    .map((shape) => {
      const title = contestFor(shape.id, shape.family).title;
      return `${shape.name} (${title}) sits off the bounce axis.`;
    })
    .join(" ");
  return `On ${layer}, ${counted.join(" and ")}. ${marks}`;
}

function courseSentence(
  a: string,
  b: string,
  aName: string,
  bName: string,
): string {
  const finishers = new Set(
    COURSES.map((course) => matchReading(a, b, course.layers).outcome),
  );
  if (finishers.has("open")) {
    return "A bounce count appears only for a body hit that is a bounce rule. The other cells name the rule. A finisher is named only when both sides clear by bouncing.";
  }
  if (finishers.has("a") && finishers.has("b")) {
    return `${aName} finishes first on some of these courses and ${bName} on others. The comparison belongs inside one course. One ranking of the pair would mix those courses into a single ladder.`;
  }
  const only = finishers.has("a") ? aName : finishers.has("b") ? bName : null;
  if (only) {
    return `On these four courses, ${only} finishes first in this bounce count. The dial is one layer, so its crossing can sit between the courses the channel publishes.`;
  }
  return "These four courses hold the pair fixed and change the course. That is the factor the table is reading.";
}

function winnerName(
  outcome: "a" | "b" | "tie" | "open",
  aName: string,
  bName: string,
): string {
  if (outcome === "a") return aName;
  if (outcome === "b") return bName;
  if (outcome === "tie") return "Tie";
  return "Open";
}

function finishSentence(
  reading: ReturnType<typeof matchReading>,
  aName: string,
  bName: string,
  health: number,
): string {
  const layer = `one layer of ${formatHealth(health)}`;
  if (reading.outcome === "tie") {
    return `On ${layer}, ${aName} and ${bName} both clear in ${formatHealth(reading.a ?? 0)} bounces.`;
  }
  const winner = reading.outcome === "a" ? aName : bName;
  return `On ${layer}, ${aName} clears in ${formatHealth(reading.a ?? 0)} bounces and ${bName} clears in ${formatHealth(reading.b ?? 0)}. ${winner} finishes first in this model.`;
}

function flipSentence(
  flip: number | null,
  a: string,
  b: string,
  aName: string,
  bName: string,
): string {
  if (flip == null) {
    const end = matchReading(a, b, [STOPS[STOPS.length - 1]]);
    const leader =
      end.outcome === "a" ? aName : end.outcome === "b" ? bName : null;
    if (!leader) return "The two stay together across this health range.";
    return `${leader} needs fewer bounces from ${formatHealth(STOPS[0])} health through ${formatHealth(STOPS[STOPS.length - 1])}.`;
  }
  const before = matchReading(a, b, [Math.max(1, flip - 1)]);
  const after = matchReading(a, b, [flip]);
  const afterName = after.outcome === "a" ? aName : bName;
  if (before.outcome === "tie" || before.outcome === "open") {
    return `The lead changes at ${formatHealth(flip)} health. ${afterName} needs fewer bounces from there.`;
  }
  const beforeName = before.outcome === "a" ? aName : bName;
  return `The lead changes at ${formatHealth(flip)} health. Below that, ${beforeName} needs fewer bounces. From there, ${afterName} does.`;
}
