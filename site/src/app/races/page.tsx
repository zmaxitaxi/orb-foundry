import type { Metadata } from "next";
import { CourseSetupTable } from "@/components/course-setup-table";

export const metadata: Metadata = {
  title: "Races",
  description: "The courses the channel uses, and the rule that decides them.",
};

export default function RacesPage() {
  return (
    <div className="grid gap-8">
      <div className="grid max-w-2xl gap-3">
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Races</h1>
        <p className="leading-7 text-muted-foreground">
          These are the courses. A recorded race will add a winner, a sentence
          of why, and a video. Until that archive is connected, each page is
          the setup and what the barrier model says about it.
        </p>
      </div>
      <CourseSetupTable />
    </div>
  );
}
