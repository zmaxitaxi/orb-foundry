import Link from "next/link";
import { FighterAvatar } from "@/components/fighter-avatar";
import { contestBridge, contestFor, type Contest } from "@/lib/contest";

export type ContestFighter = {
  id: string;
  name: string;
  color: string;
  stick: string;
  family: string;
};

export function ContestFigure({
  left,
  right,
}: {
  left: ContestFighter;
  right: ContestFighter;
}) {
  const leftRule = contestFor(left.id, left.family);
  const rightRule = contestFor(right.id, right.family);
  return (
    <figure className="grid gap-3">
      <figcaption className="grid gap-1">
        <p className="text-sm font-medium">What decides this match</p>
        <p className="text-sm text-muted-foreground">
          These two do not share a bounce axis. Each card names the rule
          that actually decides that fighter.
        </p>
      </figcaption>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch">
        <ContestSide fighter={left} contest={leftRule} />
        <p className="flex items-center text-sm leading-6 text-muted-foreground sm:max-w-44 sm:px-1 sm:text-center">
          {contestBridge(leftRule, rightRule)}
        </p>
        <ContestSide fighter={right} contest={rightRule} />
      </div>
    </figure>
  );
}

export function OffAxisNote({ fighter }: { fighter: ContestFighter }) {
  const contest = contestFor(fighter.id, fighter.family);
  const clock = contest.seconds != null || contest.span != null;
  return (
    <figure className="grid gap-3 border border-border p-3">
      <figcaption className="grid gap-1">
        <p className="text-sm font-medium">
          {clock ? "Seconds, not bounces" : "Not on the bounce axis"}
        </p>
        <p className="text-sm text-muted-foreground">
          {fighter.name} is still in the match. This mark is the rule the
          line chart cannot plot.
        </p>
      </figcaption>
      <ContestSide fighter={fighter} contest={contest} />
    </figure>
  );
}

function ContestSide({
  fighter,
  contest,
}: {
  fighter: ContestFighter;
  contest: Contest;
}) {
  return (
    <article className="grid content-start gap-3 border border-border p-3">
      <div className="h-1 border border-border" style={{ background: fighter.color }} />
      <div className="flex items-center gap-3">
        <Link
          href={`/characters/${fighter.id}`}
          target="_blank"
          aria-label={fighter.name}
        >
          <FighterAvatar src={fighter.stick} />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/characters/${fighter.id}`}
            target="_blank"
            className="font-serif text-xl tracking-tight break-words underline-offset-4 hover:underline"
          >
            {fighter.name}
          </Link>
          <p className="font-mono text-xs text-muted-foreground">{contest.title}</p>
        </div>
      </div>
      <DeadlineRuler contest={contest} />
      <p className="text-sm leading-6">{contest.rule}</p>
    </article>
  );
}

function DeadlineRuler({ contest }: { contest: Contest }) {
  if (contest.seconds != null) {
    return (
      <div>
        <div className="relative h-px bg-foreground" aria-hidden="true">
          <span className="absolute top-1/2 left-0 size-1.5 -translate-y-1/2 bg-foreground" />
          <span className="absolute top-1/2 right-0 size-2 -translate-y-1/2 border border-foreground bg-background" />
        </div>
        <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
          <span>0s</span>
          <span>{contest.seconds}s fuse</span>
        </div>
      </div>
    );
  }
  if (contest.span) {
    return (
      <div>
        <div className="relative h-px bg-foreground" aria-hidden="true">
          <span className="absolute top-1/2 left-0 size-2 -translate-y-1/2 border border-foreground bg-background" />
          <span className="absolute top-1/2 right-0 size-2 -translate-y-1/2 border border-foreground bg-background" />
        </div>
        <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
          <span>{contest.span.from}s</span>
          <span>shortens to {contest.span.to}s</span>
        </div>
      </div>
    );
  }
  return null;
}
