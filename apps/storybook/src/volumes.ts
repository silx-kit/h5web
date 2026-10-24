import ndarray, { type NdArray } from 'ndarray';
import { MathUtils } from 'three';

type Field = (x: number, y: number, z: number) => number;

/* Sample a scalar field on a regular grid spanning [-1, 1]^3 */
function sampleField(size: number, field: Field): NdArray<Float32Array> {
  const data = new Float32Array(size ** 3);
  const step = 2 / (size - 1);

  let index = 0;
  for (let k = 0; k < size; k += 1) {
    const z = -1 + k * step;
    for (let j = 0; j < size; j += 1) {
      const y = -1 + j * step;
      for (let i = 0; i < size; i += 1) {
        data[index] = field(-1 + i * step, y, z);
        index += 1;
      }
    }
  }

  return ndarray(data, [size, size, size]);
}

/*
 * Electron density of a superposition of hydrogen 4f orbitals,
 * |ψ|² with ψ ∝ e^(-r/4) (5z³ - 3zr² + 9xyz)
 */
export function createOrbital(size: number): NdArray<Float32Array> {
  const extent = 20; // Bohr radii
  return sampleField(size, (u, v, w) => {
    const [x, y, z] = [u * extent, v * extent, w * extent];
    const r2 = x * x + y * y + z * z;
    const psi =
      Math.exp(-Math.sqrt(r2) / 4) * (5 * z ** 3 - 3 * z * r2 + 9 * x * y * z);
    return psi * psi;
  });
}

/* Gyroid minimal surface, carved out by a sphere */
export function createGyroid(size: number): NdArray<Float32Array> {
  const freq = 2.5 * Math.PI;
  return sampleField(size, (x, y, z) => {
    const [a, b, c] = [x * freq, y * freq, z * freq];
    const gyroid =
      Math.sin(a) * Math.cos(b) +
      Math.sin(b) * Math.cos(c) +
      Math.sin(c) * Math.cos(a);
    const r = Math.hypot(x, y, z);
    return Math.exp(-((gyroid / 0.4) ** 2)) * Math.max(0, 1 - r ** 6);
  });
}

/*
 * Power-8 Mandelbulb fractal, as a smooth density derived from
 * its distance estimator (1 inside the set, decaying outwards)
 */
export function createMandelbulb(size: number): NdArray<Float32Array> {
  const maxIter = 12;
  const power = 8;
  return sampleField(size, (cx, cy, cz) => {
    const [px, py, pz] = [cx * 1.15, cy * 1.15, cz * 1.15];
    let [x, y, z] = [px, py, pz];
    let dr = 1;
    let r = 0;

    for (let n = 0; n < maxIter; n += 1) {
      r = Math.sqrt(x * x + y * y + z * z); // eslint-disable-line unicorn/prefer-modern-math-apis -- `Math.hypot` is much slower in this hot loop
      if (r > 2) {
        break;
      }
      const theta = Math.acos(r === 0 ? 0 : z / r) * power;
      const phi = Math.atan2(y, x) * power;
      const rn = r ** power;
      dr = power * r ** (power - 1) * dr + 1;
      x = rn * Math.sin(theta) * Math.cos(phi) + px;
      y = rn * Math.sin(theta) * Math.sin(phi) + py;
      z = rn * Math.cos(theta) + pz;
    }

    const distance = r <= 2 ? 0 : (0.5 * Math.log(r) * r) / dr;
    return Math.exp(-distance * 40);
  });
}

/*
 * Analytic test fields, each exercising a different part of the renderer
 * (integration, sampling, interpolation, gradients, etc.)
 */

/* Smooth radial density, for validating opacity accumulation */
export function createGaussianBlob(size: number): NdArray<Float32Array> {
  return sampleField(size, (x, y, z) => Math.exp(-8 * (x * x + y * y + z * z)));
}

/* Repeated sharp transitions, for exposing aliasing and step-size artefacts */
export function createShells(size: number): NdArray<Float32Array> {
  return sampleField(
    size,
    (x, y, z) => (1 + Math.cos(12 * Math.PI * Math.hypot(x, y, z))) / 2,
  );
}

/*
 * Torus of radius 0.6, as a density decaying with the squared distance
 * `d² = (√(x² + y²) - 0.6)² + z²` to its core circle (iso value e⁻² ↔ d = 0.2)
 */
export function createTorus(size: number): NdArray<Float32Array> {
  return sampleField(size, (x, y, z) => {
    const d2 = (Math.hypot(x, y) - 0.6) ** 2 + z * z;
    return Math.exp(-d2 / 0.02);
  });
}

/* Oscillations in all three directions, for testing resolution limits */
export function createInterference(size: number): NdArray<Float32Array> {
  return sampleField(
    size,
    (x, y, z) => Math.sin(10 * x) * Math.sin(11 * y) * Math.sin(12 * z),
  );
}

/* Discontinuous density, for revealing interpolation and gradient artefacts */
export function createHardSphere(size: number): NdArray<Float32Array> {
  return sampleField(size, (x, y, z) => (Math.hypot(x, y, z) <= 0.6 ? 1 : 0));
}

/* Deterministic pseudo-random value in [0, 1) for each lattice point */
function hash3(i: number, j: number, k: number): number {
  const h = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43_758.5453;
  return h - Math.floor(h);
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/* Smooth 3D value noise in [0, 1] */
function valueNoise(x: number, y: number, z: number): number {
  const [i, j, k] = [Math.floor(x), Math.floor(y), Math.floor(z)];
  const [u, v, w] = [fade(x - i), fade(y - j), fade(z - k)];

  return MathUtils.lerp(
    MathUtils.lerp(
      MathUtils.lerp(hash3(i, j, k), hash3(i + 1, j, k), u),
      MathUtils.lerp(hash3(i, j + 1, k), hash3(i + 1, j + 1, k), u),
      v,
    ),
    MathUtils.lerp(
      MathUtils.lerp(hash3(i, j, k + 1), hash3(i + 1, j, k + 1), u),
      MathUtils.lerp(hash3(i, j + 1, k + 1), hash3(i + 1, j + 1, k + 1), u),
      v,
    ),
    w,
  );
}

/* Fractal noise inside a Gaussian envelope: e^(-2|x|²) Σ 2⁻ʲ N(2ʲ x) */
export function createCloud(size: number): NdArray<Float32Array> {
  const baseFreq = 1.5;
  return sampleField(size, (x, y, z) => {
    let sum = 0;
    for (let j = 0; j < 6; j += 1) {
      const freq = baseFreq * 2 ** j;
      sum += valueNoise(freq * x, freq * y, freq * z) / 2 ** j;
    }
    return Math.exp(-2 * (x * x + y * y + z * z)) * sum;
  });
}
