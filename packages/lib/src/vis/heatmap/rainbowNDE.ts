import { scaleLinear } from 'd3-scale';

const RAINBOW_NDE_STOPS: [number, string][] = [
  [0, 'rgb(255, 255, 255)'],
  [0.1445, 'rgb(105, 166, 232)'],
  [0.2852, 'rgb(3, 21, 132)'],
  [0.4258, 'rgb(71, 164, 126)'],
  [0.5664, 'rgb(252, 240, 23)'],
  [0.707, 'rgb(211, 124, 103)'],
  [0.8477, 'rgb(202, 112, 23)'],
  [0.9883, 'rgb(145, 12, 29)'],
];

const rainbowNDEScale = scaleLinear<string>()
  .domain(RAINBOW_NDE_STOPS.map(([t]) => t))
  .range(RAINBOW_NDE_STOPS.map(([, color]) => color))
  .clamp(true);

export function interpolateRainbowNDE(t: number): string {
  return rainbowNDEScale(t);
}
