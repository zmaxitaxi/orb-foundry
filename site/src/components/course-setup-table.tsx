import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COURSES, totalHealth } from "@/lib/courses";
import { formatHealth, formatLayers } from "@/lib/format";

export function CourseSetupTable({ caption }: { caption?: string }) {
  return (
    <>
      <ul className="grid gap-4 md:hidden">
        {COURSES.map((course) => (
          <li key={course.id} className="grid gap-1 border-b border-border pb-4">
            <Link
              href={`/races/${course.id}`}
              className="underline underline-offset-4"
            >
              {course.name}
            </Link>
            <p className="text-sm text-muted-foreground">{course.slot}</p>
            <p className="text-sm">{formatLayers(course.layers)}</p>
            <p className="font-mono text-sm">
              {formatHealth(totalHealth(course.layers))} health
            </p>
          </li>
        ))}
      </ul>
      {caption ? (
        <p className="text-sm text-muted-foreground md:hidden">{caption}</p>
      ) : null}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Layers</TableHead>
              <TableHead>Health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {COURSES.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <Link
                    href={`/races/${course.id}`}
                    className="underline underline-offset-4"
                  >
                    {course.name}
                  </Link>
                </TableCell>
                <TableCell>{course.slot}</TableCell>
                <TableCell>{formatLayers(course.layers)}</TableCell>
                <TableCell className="font-mono">
                  {formatHealth(totalHealth(course.layers))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {caption ? <TableCaption>{caption}</TableCaption> : null}
        </Table>
      </div>
    </>
  );
}
