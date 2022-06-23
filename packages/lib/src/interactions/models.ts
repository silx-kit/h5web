import type { Vector2, Vector3 } from 'three';

export type ModifierKey = 'Alt' | 'Control' | 'Shift';

export enum MouseButton {
  'Left' = 0,
  'Middle' = 1,
}

export interface Selection {
  startPoint: Vector2;
  endPoint: Vector2;
  worldStartPoint: Vector2;
  worldEndPoint: Vector2;
}

export interface CanvasEvent<T extends MouseEvent> {
  htmlPt: Vector3;
  cameraPt: Vector3;
  worldPt: Vector3;
  dataPt: Vector2;
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
  button: MouseButton | 'Wheel';
  modifierKeys: ModifierKey[];
  disabled?: boolean;
}

export interface Interaction {
  button?: MouseButton;
  modifierKey?: ModifierKey | ModifierKey[];
  disabled?: boolean;
}

export type WheelInteraction = Omit<Interaction, 'button'>;

export type Interactions = Record<string, Interaction | boolean>;
