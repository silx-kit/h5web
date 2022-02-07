import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import type { ModifierKey } from '../models';
import { noModifierKeyPressed } from '../utils';
import { useZoomOnWheel } from './hooks';

const ZOOM_FACTOR = 0.95;

interface Props {
  disabled?: boolean;
  xZoom?: boolean;
  yZoom?: boolean;
  xZoomKey?: ModifierKey;
  yZoomKey?: ModifierKey;
}

function ZoomMesh(props: Props) {
  const {
    disabled,
    xZoom = false,
    yZoom = false,
    xZoomKey = 'Alt',
    yZoomKey = 'Shift',
  } = props;

  const { width, height } = useThree((state) => state.size);

  const zoomVector = (sourceEvent: WheelEvent) => {
    const factor = sourceEvent.deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

    const noKeyPressed = noModifierKeyPressed(sourceEvent);
    return new Vector3(
      noKeyPressed || (xZoom && sourceEvent.getModifierState(xZoomKey))
        ? 1 / factor
        : 1,
      noKeyPressed || (yZoom && sourceEvent.getModifierState(yZoomKey))
        ? 1 / factor
        : 1,
      1
    );
  };

  const onWheel = useZoomOnWheel(zoomVector, disabled);

  return (
    <mesh onWheel={onWheel}>
      <meshBasicMaterial opacity={0} transparent />
      <planeGeometry args={[width, height]} />
    </mesh>
  );
}

export default ZoomMesh;
