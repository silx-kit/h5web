import type { Vector2, Vector3 } from 'three';

export type ModifierKey = 'Alt' | 'Control' | 'Shift';

export enum MouseButton {
  'Left' = 0,
  'Middle' = 1,
}

export interface Selection {
  world: Rect3;
  data: Rect2;
}

export type Rect<T extends Vector2 | Vector3> = [T, T];
export type Rect2 = Rect<Vector2>;
export type Rect3 = Rect<Vector3>;

export interface CanvasEvent<T extends MouseEvent> {
  htmlPt: Vector2;
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
  button: MouseButton | MouseButton[] | 'Wheel';
  modifierKeys: ModifierKey[];
  disabled?: boolean;
}

export interface CommonInteractionProps {
  modifierKey?: ModifierKey | ModifierKey[];
  disabled?: boolean;
}
