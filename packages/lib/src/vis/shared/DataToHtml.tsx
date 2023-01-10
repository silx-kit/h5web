import type { MappedTuple } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import type { ReactNode } from 'react';
import type { Vector3 } from 'three';

import { useVisCanvasContext } from './VisCanvasProvider';

interface Props<T extends Vector3[]> {
  points: T;
  children: (...points: MappedTuple<T, Vector3>) => ReactNode;
}

function DataToHtml<T extends Vector3[]>(props: Props<T>) {
  const { points, children } = props;

  const { dataToHtml } = useVisCanvasContext();
  const camera = useThree((state) => state.camera);

  const htmlPoints = points.map((pt) => {
    return dataToHtml(camera, pt);
  }) as MappedTuple<T, Vector3>;

  return <>{children(...htmlPoints)}</>;
}

export type { Props as DataToHtmlProps };
export default DataToHtml;
