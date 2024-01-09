import type { MappedTuple } from '@h5web/shared/vis-models';
import type { ReactNode } from 'react';
import type { Vector3 } from 'three';

import { useCameraState } from '../hooks';
import { useVisCanvasContext } from './VisCanvasProvider';

interface Props<T extends Vector3[]> {
  points: T;
  children: (...points: MappedTuple<T>) => ReactNode;
}

function DataToHtml<T extends Vector3[]>(props: Props<T>) {
  const { points, children } = props;

  const { dataToHtml } = useVisCanvasContext();
  const htmlPoints = useCameraState(
    (camera) => points.map((pt) => dataToHtml(camera, pt)) as MappedTuple<T>,
    [points, dataToHtml],
  );

  return <>{children(...htmlPoints)}</>;
}

export type { Props as DataToHtmlProps };
export default DataToHtml;
