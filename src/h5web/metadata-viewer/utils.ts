export function renderShapeDims(dims: number[]): string {
  if (dims.length > 1) {
    return `${dims.join(' x ')} = ${dims.reduce((acc, value) => acc * value)}`;
  }

  return dims.toString();
}
