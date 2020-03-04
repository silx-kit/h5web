import React from 'react';
import { isSimpleShape } from '../providers/type-guards';
import { HDF5Shape } from '../providers/models';

interface Props {
  shape: HDF5Shape;
}

function renderShapeDims(dims: number[]): string {
  if (dims.length > 1) {
    return `${dims.join(' x ')} = ${dims.reduce((acc, value) => acc * value)}`;
  }

  return dims.toString();
}

function ShapeRenderer(props: Props): JSX.Element {
  const { shape } = props;

  return (
    <>{isSimpleShape(shape) ? renderShapeDims(shape.dims) : shape.class}</>
  );
}

export default ShapeRenderer;
