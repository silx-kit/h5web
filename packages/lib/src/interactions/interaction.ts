import { castArray } from 'lodash';
import type { ModifierKey } from 'react';

import type { InteractionConfig } from './models';
import { MouseButton } from './models';

export class Interaction {
  public readonly buttons: MouseButton[];
  public readonly modifierKeys: ModifierKey[];
  public readonly isWheel: boolean;
  public readonly isEnabled: boolean;

  public constructor(
    public readonly id: string,
    config: InteractionConfig,
  ) {
    const {
      button = MouseButton.Left,
      modifierKey = [],
      disabled = false,
    } = config;

    if (button === 'Wheel') {
      this.buttons = [];
      this.isWheel = true;
    } else {
      this.buttons = castArray(button);
      this.isWheel = false;
    }

    this.modifierKeys = castArray(modifierKey);
    this.isEnabled = !disabled;
  }

  public matches(event: MouseEvent): boolean {
    return (
      this.isEnabled &&
      (event instanceof WheelEvent
        ? this.isWheel
        : this.buttons.includes(event.button)) &&
      this.modifierKeys.every((key) => event.getModifierState(key))
    );
  }
}
