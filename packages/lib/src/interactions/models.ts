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

export interface InteractionInfo {
  shortcut: string;
  description: string;
}

export interface InteractionConfig extends CommonInteractionProps {
  button?: MouseButton | MouseButton[] | 'Wheel';
}

export interface CommonInteractionProps {
  modifierKey?: ModifierKey | ModifierKey[];
  disabled?: boolean;
}

export interface UseDragOpts {
  onDragEnd: (delta: Vector3) => void;
}

export interface UseDragState {
  delta: Vector3;
  isDragging: boolean;
  startDrag: (evt: PointerEvent) => void;
}

export type MouseEventName = {
  [Key in keyof GlobalEventHandlersEventMap]: GlobalEventHandlersEventMap[Key] extends MouseEvent
    ? Key
    : never;
}[keyof GlobalEventHandlersEventMap];
