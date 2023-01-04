import type { MappedTuple } from '@h5web/shared';
import type { ReactNode } from 'react';
import type { Vector2, Vector3 } from 'three';

import { useVisCanvasContext } from './VisCanvasProvider';

interface Props<T extends Vector2[]> {
  coords: T;
  children: (...coords: MappedTuple<T, Vector3>) => ReactNode;
}

function DataToWorld<T extends Vector2[]>(props: Props<T>) {
  const { coords, children } = props;

  const { dataToWorld } = useVisCanvasContext();
  const worldCoords = coords.map(dataToWorld) as MappedTuple<T, Vector3>;

  return <>{children(...worldCoords)}</>;
}

export default DataToWorld;
