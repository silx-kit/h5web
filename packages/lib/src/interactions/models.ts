import type { Vector2, Vector3 } from 'three';

export type ModifierKey = 'Alt' | 'Control' | 'Shift';

export interface Selection {
  startPoint: Vector2;
  endPoint: Vector2;
}

export interface CanvasEvent<T extends MouseEvent> {
  unprojectedPoint: Vector3;
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

export interface Interaction {
  modifierKey?: ModifierKey;
  disabled?: boolean;
}

export type Interactions = Record<string, Interaction | boolean>;
