import { type KeyboardEvent } from 'react';
import { MathUtils } from 'three';

export async function download(
  url: URL | (() => Promise<URL | Blob>),
  filename: string,
): Promise<void> {
  const urlOrBlob = url instanceof URL ? url : await url();

  const anchor = document.createElement('a');
  anchor.download = filename;
  document.body.append(anchor);

  anchor.href =
    urlOrBlob instanceof Blob ? URL.createObjectURL(urlOrBlob) : urlOrBlob.href;
  anchor.click();

  URL.revokeObjectURL(anchor.href);
  anchor.remove();
}

export function getAllOptions<T>(options: Record<string, T[]> | T[]): T[] {
  return Array.isArray(options) ? options : Object.values(options).flat();
}

const SLIDER_KEY_STEPS: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
  PageDown: -10,
  PageUp: 10,
  Home: -Infinity,
  End: Infinity,
};

// Move slider thumb with arrow keys, PageUp/PageDown, Home/End
export function handleSliderKey(
  evt: KeyboardEvent,
  value: number,
  min: number,
  max: number,
  onChange: (newValue: number) => void,
): void {
  const step = SLIDER_KEY_STEPS[evt.key];
  if (step !== undefined) {
    evt.preventDefault();
    onChange(MathUtils.clamp(value + step, min, max));
  }
}
