import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid max-w-xl gap-4">
      <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">That page is missing</h1>
      <p className="leading-7 text-muted-foreground">
        The roster, the courses, and the lab are the pages that exist.
      </p>
      <Link href="/" className="text-sm underline underline-offset-4">
        Home
      </Link>
    </div>
  );
}
