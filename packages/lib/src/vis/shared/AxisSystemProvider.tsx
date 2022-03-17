import { useThree } from '@react-three/fiber';
import type { PropsWithChildren } from 'react';
import { useCallback, useMemo } from 'react';
import { Matrix4, Vector2, Vector3 } from 'three';

import type { InteractionKeys, ModifierKey } from '../../interactions/models';
import type { AxisConfig } from '../models';
import { getCanvasScale, getSizeToFit } from '../utils';
import { AxisSystemContext } from './AxisSystemContext';

interface Props {
  visRatio: number | undefined;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  interactionKeys: InteractionKeys;
}

function AxisSystemProvider(props: PropsWithChildren<Props>) {
  const {
    visRatio,
    abscissaConfig,
    ordinateConfig,
    children,
    interactionKeys,
  } = props;

  const availableSize = useThree((state) => state.size);
  const visSize = getSizeToFit(availableSize, visRatio);

  const abscissaScale = getCanvasScale(abscissaConfig, visSize.width);
  const ordinateScale = getCanvasScale(ordinateConfig, visSize.height);

  const worldToData = (vec: Vector2 | Vector3) =>
    new Vector2(abscissaScale.invert(vec.x), ordinateScale.invert(vec.y));
  const dataToWorld = (vec: Vector2 | Vector3) =>
    new Vector2(abscissaScale(vec.x), ordinateScale(vec.y));

  const cameraToHtmlMatrix = useMemo(() => {
    const { width, height } = availableSize;

    const matrix = new Matrix4().makeScale(width / 2, -height / 2, 1);
    // Account for shift of (0,0) position (center for camera, top-left for HTML)
    matrix.setPosition(width / 2, height / 2);
    return matrix;
  }, [availableSize]);

  const camera = useThree((state) => state.camera);
  const worldToHtml = useCallback(
    (point: Vector2 | Vector3) => {
      const cameraPoint = new Vector3(point.x, point.y, 0).project(camera);
      const htmlPoint = cameraPoint.clone().applyMatrix4(cameraToHtmlMatrix);
      return new Vector2(htmlPoint.x, htmlPoint.y);
    },
    [camera, cameraToHtmlMatrix]
  );

  const registeredKeys = Object.values(interactionKeys).filter(
    (k) => k !== true
  ) as ModifierKey[];
  const keySet = new Set(registeredKeys);
  if (keySet.size !== registeredKeys.length) {
    throw new Error('Two interactions were registered on the same key !');
  }

  const getModifierKey = useCallback(
    (id: string) => {
      if (!Object.keys(interactionKeys).includes(id)) {
        throw new Error(`Interaction ${id} was not registered in VisCanvas.`);
      }

      const interactionKey = interactionKeys[id];

      return interactionKey === true ? undefined : interactionKey;
    },
    [interactionKeys]
  );

  const shouldInteract = useCallback(
    (id: string, event: MouseEvent) => {
      const interactionKey = getModifierKey(id);
      if (interactionKey !== undefined) {
        return event.getModifierState(interactionKey);
      }

      // Check that there is no conflicting interaction
      return registeredKeys.every((key) => !event.getModifierState(key));
    },
    [getModifierKey, registeredKeys]
  );

  return (
    <AxisSystemContext.Provider
      value={{
        abscissaConfig,
        ordinateConfig,
        abscissaScale,
        ordinateScale,
        worldToData,
        dataToWorld,
        worldToHtml,
        visSize,
        shouldInteract,
        getModifierKey,
      }}
    >
      {children}
    </AxisSystemContext.Provider>
  );
}

export default AxisSystemProvider;
