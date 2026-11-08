"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatHealth } from "@/lib/format";

export type FinishSeries = {
  id: string;
  name: string;
  color: string;
  points: { health: number; bounces: number }[];
};

const HIT = 24;

export function FinishChart({
  series,
  markerHealth,
  onMarkerHealth,
}: {
  series: FinishSeries[];
  markerHealth: number;
  onMarkerHealth?: (health: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onHealthRef = useRef(onMarkerHealth);
  onHealthRef.current = onMarkerHealth;
  const clipId = useId().replace(/:/g, "");
  const [width, setWidth] = useState(0);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<HoverHit | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => setWidth(host.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const layout = width >= 240 ? layoutChart(series, width) : null;

  const motionKey = `${Math.round(width)}:${series.map((item) => item.id).join("|")}`;
  useEffect(() => {
    const host = hostRef.current;
    if (!host || width < 240) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const origin = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - origin) / 1000;
      const paths = host.querySelectorAll<SVGPathElement>("path.finish-line");
      paths.forEach((path, seriesIndex) => {
        const length = path.getTotalLength();
        if (!length) return;
        const duration = 16 + seriesIndex * 2.5;
        host
          .querySelectorAll<SVGGElement>(`[data-travel="${seriesIndex}"]`)
          .forEach((node) => {
            const offset = Number(node.dataset.offset ?? 0);
            const distance = length * (((elapsed / duration) + offset) % 1);
            const point = path.getPointAtLength(distance);
            node.setAttribute(
              "transform",
              `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`,
            );
          });
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [motionKey, width]);
  const markerX = layout ? layout.x(markerHealth) : 0;
  const readout = layout
    ? series.map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color,
        bounces: bouncesAt(item, markerHealth),
      }))
    : [];

  function healthFromX(x: number): number | null {
    if (!layout || series[0] == null) return null;
    const span = layout.innerWidth || 1;
    const t = Math.min(1, Math.max(0, (x - layout.margin.left) / span));
    const log =
      Math.log(layout.xLo) + t * (Math.log(layout.xHi) - Math.log(layout.xLo));
    const raw = Math.exp(log);
    let best = series[0].points[0]?.health;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const point of series[0].points) {
      const distance = Math.abs(Math.log(point.health) - Math.log(raw));
      if (distance < bestDistance) {
        best = point.health;
        bestDistance = distance;
      }
    }
    return best ?? null;
  }

  function placeDial(clientX: number, clientY: number) {
    const local = toLocal(hostRef.current?.querySelector("svg") ?? null, clientX, clientY);
    if (!local || !layout) return;
    if (local.y < layout.margin.top || local.y > layout.height - layout.margin.bottom) return;
    const health = healthFromX(local.x);
    if (health != null) onHealthRef.current?.(health);
  }

  function trackHover(clientX: number, clientY: number) {
    const svg = hostRef.current?.querySelector("svg") ?? null;
    const local = toLocal(svg, clientX, clientY);
    if (!local || !layout) {
      setHover(null);
      return;
    }
    let best: HoverHit | null = null;
    let bestDistance = HIT;
    for (const item of series) {
      for (const point of item.points) {
        const px = layout.x(point.health);
        const py = layout.y(point.bounces);
        const distance = Math.hypot(px - local.x, py - local.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = {
            id: item.id,
            name: item.name,
            color: item.color,
            health: point.health,
            bounces: point.bounces,
            px,
            py,
          };
        }
      }
    }
    setHover(best);
  }

  const tooltip = hover && layout ? tooltipBox(hover, width) : null;

  return (
    <div
      ref={hostRef}
      className="relative w-full max-w-full text-foreground"
      style={{ minHeight: layout?.height ?? 300 }}
    >
      {layout ? (
        <svg
          width={width}
          height={layout.height}
          role="slider"
          aria-label="Layer health"
          aria-valuemin={layout.xLo}
          aria-valuemax={layout.xHi}
          aria-valuenow={markerHealth}
          aria-valuetext={`${formatHealth(markerHealth)} health`}
          className="touch-none select-none"
          style={{ cursor: dragging ? "ew-resize" : "crosshair" }}
          onPointerDown={(event) => {
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              // The pointer can already be released.
            }
            draggingRef.current = true;
            setDragging(true);
            placeDial(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (draggingRef.current) placeDial(event.clientX, event.clientY);
            else trackHover(event.clientX, event.clientY);
          }}
          onPointerUp={(event) => {
            draggingRef.current = false;
            setDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            trackHover(event.clientX, event.clientY);
          }}
          onPointerLeave={() => {
            if (!draggingRef.current) setHover(null);
          }}
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x={layout.margin.left}
                y={layout.margin.top}
                width={layout.innerWidth}
                height={layout.innerHeight}
              />
            </clipPath>
          </defs>
          {layout.yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={layout.margin.left}
                x2={width - layout.margin.right}
                y1={layout.y(tick)}
                y2={layout.y(tick)}
                stroke="currentColor"
                strokeOpacity={0.12}
              />
              <text
                x={layout.margin.left - 6}
                y={layout.y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-current font-mono"
                fontSize={layout.narrow ? 10 : 11}
              >
                {formatTick(tick)}
              </text>
            </g>
          ))}
          {layout.xTicks.map((tick) => (
            <text
              key={`x-${tick}`}
              x={layout.x(tick)}
              y={layout.height - layout.margin.bottom + (layout.narrow ? 14 : 18)}
              textAnchor="middle"
              className="fill-current font-mono"
              fontSize={layout.narrow ? 10 : 11}
            >
              {formatTick(tick)}
            </text>
          ))}
          <text
            x={layout.margin.left + layout.innerWidth / 2}
            y={layout.height - 6}
            textAnchor="middle"
            className="fill-current"
            fontSize={layout.narrow ? 11 : 12}
          >
            One layer, health
          </text>
          {layout.narrow ? null : (
            <text
              x={16}
              y={layout.margin.top + layout.innerHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(-90 16 ${layout.margin.top + layout.innerHeight / 2})`}
              className="fill-current"
              fontSize={12}
            >
              Bounces
            </text>
          )}
          <g clipPath={`url(#${clipId})`}>
            {series.map((item, seriesIndex) => {
              const d = linePath(item, layout);
              return (
                <g key={item.id}>
                  <path
                    d={d}
                    pathLength={1}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={2.25}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="finish-line"
                  />
                  {[0, 0.5].map((offset) => (
                    <g
                      key={offset}
                      className="finish-traveler"
                      data-travel={seriesIndex}
                      data-offset={offset}
                      pointerEvents="none"
                    >
                      <circle r={8} fill={item.color} fillOpacity={0.28} />
                      <circle r={3.2} fill="#fffaf0" />
                    </g>
                  ))}
                </g>
              );
            })}
            <line
              x1={markerX}
              x2={markerX}
              y1={layout.margin.top}
              y2={layout.height - layout.margin.bottom}
              stroke="currentColor"
              strokeOpacity={0.45}
              strokeWidth={dragging ? 2 : 1.25}
            />
            {series.map((item) => {
              const bounces = bouncesAt(item, markerHealth);
              if (bounces == null) return null;
              return (
                <circle
                  key={item.id}
                  cx={markerX}
                  cy={layout.y(bounces)}
                  r={4.5}
                  fill={item.color}
                  stroke="var(--background)"
                  strokeWidth={1.5}
                  className="finish-dial-dot"
                />
              );
            })}
            {hover ? (
              <circle
                cx={hover.px}
                cy={hover.py}
                r={7}
                fill="none"
                stroke={hover.color}
                strokeWidth={1.5}
              />
            ) : null}
          </g>
        </svg>
      ) : null}
      {tooltip && hover ? (
        <div
          className="pointer-events-none absolute z-10 grid min-w-40 gap-1 border border-foreground bg-background px-3 py-2 text-sm shadow-[3px_3px_0_0_var(--foreground)]"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          <p className="font-medium">{hover.name}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatHealth(hover.health)} health
          </p>
          <p className="font-mono text-xs">{formatHealth(hover.bounces)} bounces</p>
          {series
            .filter((item) => item.id !== hover.id)
            .map((item) => {
              const point = item.points.find((entry) => entry.health === hover.health);
              if (!point) return null;
              return (
                <p key={item.id} className="font-mono text-xs text-muted-foreground">
                  {item.name} {formatHealth(point.bounces)}
                </p>
              );
            })}
        </div>
      ) : null}
      {dragging && layout ? (
        <div
          className="pointer-events-none absolute z-10 grid gap-1 border border-foreground bg-background px-3 py-2 text-sm shadow-[3px_3px_0_0_var(--foreground)]"
          style={{
            left: Math.min(Math.max(markerX + 12, 8), Math.max(8, width - 168)),
            top: layout.margin.top + 8,
          }}
        >
          <p className="font-mono text-xs">{formatHealth(markerHealth)} health</p>
          {readout.map((item) => (
            <p key={item.id} className="inline-flex items-center gap-2 font-mono text-xs">
              <span className="size-2 border border-border" style={{ background: item.color }} />
              {item.name} {item.bounces == null ? "—" : formatHealth(item.bounces)}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type HoverHit = {
  id: string;
  name: string;
  color: string;
  health: number;
  bounces: number;
  px: number;
  py: number;
};

type ChartLayout = {
  height: number;
  narrow: boolean;
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
  xLo: number;
  xHi: number;
  yLo: number;
  yHi: number;
  xTicks: number[];
  yTicks: number[];
  x: (health: number) => number;
  y: (bounces: number) => number;
};

function layoutChart(series: FinishSeries[], width: number): ChartLayout {
  const narrow = width < 520;
  const margin = narrow
    ? { top: 8, right: 4, bottom: 34, left: 36 }
    : { top: 18, right: 16, bottom: 48, left: 64 };
  const height = narrow ? 300 : 380;
  const healths = series.flatMap((item) => item.points.map((point) => point.health));
  const bounces = series.flatMap((item) => item.points.map((point) => point.bounces));
  const xLo = padLow(Math.min(...healths));
  const xHi = padHigh(Math.max(...healths));
  const yLo = padLow(Math.min(...bounces));
  const yHi = padHigh(Math.max(...bounces));
  const innerWidth = Math.max(1, width - margin.left - margin.right);
  const innerHeight = height - margin.top - margin.bottom;
  const x = (health: number) => margin.left + logT(health, xLo, xHi) * innerWidth;
  const y = (value: number) =>
    margin.top + (1 - logT(value, yLo, yHi)) * innerHeight;
  const xTicks = axisTicks(Math.min(...healths), Math.max(...healths));
  return {
    height,
    narrow,
    margin,
    innerWidth,
    innerHeight,
    xLo,
    xHi,
    yLo,
    yHi,
    xTicks: narrow && xTicks.length > 5 ? xTicks.filter((_, index) => index % 2 === 0) : xTicks,
    yTicks: axisTicks(Math.min(...bounces), Math.max(...bounces)),
    x,
    y,
  };
}

function linePath(item: FinishSeries, layout: ChartLayout): string {
  return item.points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${layout.x(point.health).toFixed(2)} ${layout.y(point.bounces).toFixed(2)}`;
    })
    .join(" ");
}

function bouncesAt(item: FinishSeries, health: number): number | null {
  let best: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const point of item.points) {
    const distance = Math.abs(Math.log(point.health) - Math.log(Math.max(1, health)));
    if (distance < bestDistance) {
      best = point.bounces;
      bestDistance = distance;
    }
  }
  return best;
}

function tooltipBox(hover: HoverHit, width: number): { left: number; top: number } {
  const boxWidth = 176;
  const left = hover.px + 14 + boxWidth > width ? hover.px - boxWidth - 10 : hover.px + 14;
  const top = Math.max(8, hover.py - 72);
  return { left: Math.max(8, left), top };
}

function toLocal(svg: SVGSVGElement | null, clientX: number, clientY: number) {
  if (!svg) return null;
  const rect = svg.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function logT(value: number, low: number, high: number): number {
  if (high <= low) return 0.5;
  return (Math.log(Math.max(value, low)) - Math.log(low)) / (Math.log(high) - Math.log(low));
}

function padLow(value: number): number {
  return Math.max(0.5, value / 1.35);
}

function padHigh(value: number): number {
  return value * 1.35;
}

function axisTicks(min: number, max: number): number[] {
  const decades: number[] = [];
  const start = Math.ceil(Math.log10(min));
  const end = Math.floor(Math.log10(max));
  for (let exponent = start; exponent <= end; exponent += 1) decades.push(10 ** exponent);
  if (decades.length >= 3) return decades;
  const ticks: number[] = [];
  const from = Math.floor(Math.log10(Math.max(min, 0.5)));
  const to = Math.ceil(Math.log10(max));
  for (let exponent = from; exponent <= to; exponent += 1) {
    for (const multiplier of [1, 2, 5]) {
      const value = multiplier * 10 ** exponent;
      if (value >= min && value <= max) ticks.push(value);
    }
  }
  return ticks.length > 0 ? ticks : [min, max];
}

function formatTick(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10000 ? 1 : 0,
  }).format(value);
}
