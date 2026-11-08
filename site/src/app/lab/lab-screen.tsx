"use client";

import { useSearchParams } from "next/navigation";
import { CourseLab, type ShapeOption } from "@/components/course-lab";

export function LabScreen({ shapes }: { shapes: ShapeOption[] }) {
  const query = useSearchParams();
  const known = new Set(shapes.map((shape) => shape.id));
  const requestedA = query.get("a");
  const requestedB = query.get("b");
  const initialA =
    requestedA && known.has(requestedA) ? requestedA : "x-squared";
  const initialB =
    requestedB && known.has(requestedB) && requestedB !== initialA
      ? requestedB
      : initialA === "fibonacci"
        ? "x-squared"
        : "fibonacci";

  return (
    <CourseLab shapes={shapes} initialA={initialA} initialB={initialB} />
  );
}
