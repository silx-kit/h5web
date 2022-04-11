import { assertDefined, isDefined } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import type { PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';
import type { Vector3 } from 'three';
import { Matrix4, Vector2 } from 'three';

import type { Interaction } from '../../interactions/models';
import type { AxisConfig } from '../models';
import { getCanvasScale, getSizeToFit } from '../utils';
import { AxisSystemContext } from './AxisSystemContext';

interface Props {
  visRatio: number | undefined;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  floatingToolbar: HTMLDivElement | undefined;
}

function AxisSystemProvider(props: PropsWithChildren<Props>) {
  const {
    visRatio,
    abscissaConfig,
    ordinateConfig,
    children,
    floatingToolbar,
  } = props;

  const availableSize = useThree((state) => state.size);
  const visSize = getSizeToFit(availableSize, visRatio);

  const abscissaScale = getCanvasScale(abscissaConfig, visSize.width);
  const ordinateScale = getCanvasScale(ordinateConfig, visSize.height);

  const worldToData = (vec: Vector2 | Vector3) =>
    new Vector2(abscissaScale.invert(vec.x), ordinateScale.invert(vec.y));
  const dataToWorld = (vec: Vector2 | Vector3) =>
    new Vector2(abscissaScale(vec.x), ordinateScale(vec.y));

  const { width, height } = availableSize;
  const cameraToHtmlMatrix = new Matrix4()
    .makeScale(width / 2, -height / 2, 1)
    .setPosition(width / 2, height / 2); // account for shift of (0,0) position (center for camera, top-left for HTML)

  const [interactionMap] = useState(new Map<string, Interaction>());

  const registerInteraction = useCallback(
    (id: string, value: Interaction) => {
      interactionMap.set(id, value);
    },
    [interactionMap]
  );

  const unregisterInteraction = useCallback(
    (id: string) => {
      interactionMap.delete(id);
    },
    [interactionMap]
  );

  const shouldInteract = useCallback(
    (id: string, event: MouseEvent) => {
      const registeredKeys = [...interactionMap.values()]
        .map((params: Interaction) => params.modifierKey)
        .filter(isDefined);

      const params = interactionMap.get(id);
      assertDefined(params, `Interaction ${id} is not registered.`);

      const { disabled, modifierKey } = params;
      if (disabled) {
        return false;
      }

      if (modifierKey !== undefined) {
        return event.getModifierState(modifierKey);
      }

      // Check that there is no conflicting interaction
      return registeredKeys.every((key) => !event.getModifierState(key));
    },
    [interactionMap]
  );

  return (
    <AxisSystemContext.Provider
      value={{
        visSize,
        abscissaConfig,
        ordinateConfig,
        abscissaScale,
        ordinateScale,
        worldToData,
        dataToWorld,
        cameraToHtmlMatrix,
        registerInteraction,
        unregisterInteraction,
        shouldInteract,
        floatingToolbar,
      }}
    >
      {children}
    </AxisSystemContext.Provider>
  );
}

export default AxisSystemProvider;
