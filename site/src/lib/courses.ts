export type CourseId = "short" | "friday" | "longform" | "saturday";

export type Course = {
  id: CourseId;
  name: string;
  slot: string;
  layers: number[];
  summary: string;
};

const LONGFORM_TEMPLATE = [
  750, 1000, 1500, 2000, 3000, 4500, 6500, 8500, 11000, 14000, 18000, 24000,
  32000,
];

function expandLongform(count: number): number[] {
  const layers = [...LONGFORM_TEMPLATE];
  const lastIncrement = layers[layers.length - 1] - layers[layers.length - 2];
  while (layers.length < count) {
    layers.push(layers[layers.length - 1] + lastIncrement);
  }
  return layers;
}

export const COURSES: Course[] = [
  {
    id: "short",
    name: "Short",
    slot: "Noon and afternoon shorts",
    layers: [750, 1000, 1500],
    summary:
      "Three layers. This is the course a Short uses. The first team through all three wins.",
  },
  {
    id: "friday",
    name: "Friday tournament",
    slot: "Friday afternoon long-form",
    layers: [750, 1000, 1500, 2500, 5000],
    summary:
      "Five layers, sixteen entrants, under the title Who is the Best Orb? The course is fixed. The cast changes.",
  },
  {
    id: "longform",
    name: "Long-form",
    slot: "Noon and afternoon long-form",
    layers: expandLongform(50),
    summary:
      "The long-form profile runs thirteen steps, then repeats the last step of 8,000 until there are fifty layers.",
  },
  {
    id: "saturday",
    name: "Everyone vs Infinity",
    slot: "Saturday afternoon long-form",
    layers: Array.from({ length: 50 }, () => 32000),
    summary:
      "Fifty layers, each at 32,000, the top of the long-form profile. One side is Infinity.",
  },
];

export function courseById(id: string): Course | undefined {
  return COURSES.find((course) => course.id === id);
}

export function totalHealth(layers: number[]): number {
  return layers.reduce((sum, layer) => sum + layer, 0);
}
