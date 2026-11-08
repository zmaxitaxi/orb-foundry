export function formatHealth(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    value,
  );
}

export function formatLayers(layers: number[]): string {
  if (layers.length === 0) return "No layers";
  const same = layers.every((value) => value === layers[0]);
  if (same) {
    return `${formatHealth(layers.length)} layers at ${formatHealth(layers[0])}`;
  }
  if (layers.length <= 6) return layers.map(formatHealth).join(", ");
  return `${formatHealth(layers.length)} layers, from ${formatHealth(layers[0])} to ${formatHealth(layers[layers.length - 1])}`;
}
