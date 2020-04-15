import { useState, useEffect } from 'react';
import { Vis } from './models';
import { HDF5Dataset } from '../providers/models';
import {
  isBaseType,
  isSimpleShape,
  hasSimpleDims,
  isScalarShape,
  isNumericType,
} from '../providers/utils';

type SupportFunction = (dataset: HDF5Dataset) => boolean;

const SUPPORT_CHECKS: Record<Vis, SupportFunction> = {
  [Vis.Raw]: () => true,
  [Vis.Scalar]: dataset => {
    const { type, shape } = dataset;
    return isBaseType(type) && isScalarShape(shape);
  },
  [Vis.Matrix]: dataset => {
    const { type, shape } = dataset;
    return isBaseType(type) && isSimpleShape(shape) && hasSimpleDims(shape);
  },
  [Vis.Line]: dataset => {
    const { type, shape } = dataset;
    return (
      isNumericType(type) && isSimpleShape(shape) && shape.dims.length === 1
    );
  },
  [Vis.Heatmap]: dataset => {
    const { type, shape } = dataset;
    return (
      isNumericType(type) && isSimpleShape(shape) && shape.dims.length === 2
    );
  },
};

export function getSupportedVis(dataset?: HDF5Dataset): Vis[] {
  if (!dataset) {
    return [];
  }
  const supported = Object.entries(SUPPORT_CHECKS).reduce<Vis[]>(
    (arr, [vis, check]) => (check(dataset) ? [...arr, vis as Vis] : arr),
    []
  );

  // Remove Raw vis if any other vis is supported
  return supported.length > 1 ? supported.slice(1) : supported;
}

export function useActiveVis(
  supportedVis: Vis[]
): [Vis | undefined, (vis: Vis) => void] {
  const [activeVis, setActiveVis] = useState<Vis>();

  // When switching between two datasets, `activeVis` may become stale for one render
  const isValid = activeVis && supportedVis.includes(activeVis);

  useEffect(() => {
    if (!isValid) {
      setActiveVis(supportedVis[supportedVis.length - 1]);
    }
  }, [isValid, supportedVis]);

  return [isValid ? activeVis : undefined, setActiveVis];
}
