import type { Vector3 } from 'three';

export type ModifierKey = 'Alt' | 'Control' | 'Shift';

export enum MouseButton {
  'Left' = 0,
  'Middle' = 1,
}

export type Rect = [Vector3, Vector3];

export interface Selection {
  html: Rect;
  world: Rect;
  data: Rect;
}

export interface CanvasEvent<T extends MouseEvent> {
  htmlPt: Vector3;
  worldPt: Vector3;
  dataPt: Vector3;
  sourceEvent: T;
}

export interface CanvasEventCallbacks {
  onPointerDown?: (evt: CanvasEvent<PointerEvent>) => void;
  onPointerMove?: (evt: CanvasEvent<PointerEvent>) => void;
  onPointerUp?: (evt: CanvasEvent<PointerEvent>) => void;
  onWheel?: (evt: CanvasEvent<WheelEvent>) => void;
}

export interface InteractionInfo {
  shortcut: string;
  description: string;
}

export interface InteractionEntry {
  button: MouseButton | MouseButton[] | 'Wheel';
  modifierKeys: ModifierKey[];
  disabled?: boolean;
}

export interface CommonInteractionProps {
  modifierKey?: ModifierKey | ModifierKey[];
  disabled?: boolean;
}
