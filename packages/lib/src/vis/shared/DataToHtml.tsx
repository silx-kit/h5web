import type { MappedTuple } from '@h5web/shared';
import type { ReactNode } from 'react';
import type { Vector3 } from 'three';

import { useCameraState } from '../hooks';

interface Props<T extends Vector3[]> {
  points: T;
  children: (...points: MappedTuple<T, Vector3>) => ReactNode;
}

function DataToHtml<T extends Vector3[]>(props: Props<T>) {
  const { points, children } = props;

  const htmlPoints = useCameraState(
    (camera, { dataToHtml }) =>
      points.map((pt) => dataToHtml(camera, pt)) as MappedTuple<T, Vector3>,
    [points]
  );

  return <>{children(...htmlPoints)}</>;
}

export type { Props as DataToHtmlProps };
export default DataToHtml;
