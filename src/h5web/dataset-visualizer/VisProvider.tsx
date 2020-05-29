import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { isNumber } from 'lodash-es';
import ndarray from 'ndarray';
import unpack from 'ndarray-unpack';
import type { DimensionMapping, Vis, ScalarData, DataArray } from './models';
import type { HDF5Dataset } from '../providers/models';
import { useValue } from '../providers/hooks';
import { isSimpleShape } from '../providers/utils';

export const VisContext = createContext<DataArray | ScalarData | undefined>(
  undefined
);

type Props = {
  activeVis: Vis;
  mapperState?: DimensionMapping;
  dataset: HDF5Dataset;
  children: ReactNode;
};

function VisProvider(props: Props): ReactElement {
  const { dataset, mapperState, children } = props;
  const rawValues = useValue(dataset.id);
  const rawDims = isSimpleShape(dataset.shape) ? dataset.shape.dims : [];

  const values = useMemo(() => {
    if (rawValues === undefined) {
      return undefined;
    }

    if (rawDims.length !== 0) {
      const rawDataArray = ndarray(rawValues.flat(Infinity), rawDims);
      if (mapperState === undefined) {
        return rawDataArray;
      }
      const slicingIndices = mapperState.map((val) =>
        isNumber(val) ? val : null
      );
      // The dimensions untouched by the slicing are only the ones of 'x' and 'y'
      const slicedDims = rawDims.filter((d, i) => !isNumber(mapperState[i]));
      return ndarray(
        unpack(rawDataArray.pick(...slicingIndices)).flat(Infinity),
        slicedDims
      );
    }

    return rawValues;
  }, [rawValues, rawDims, mapperState]);

  if (values === undefined) {
    return <></>;
  }

  return <VisContext.Provider value={values}>{children}</VisContext.Provider>;
}

export function useDataArray(): DataArray {
  const visData = useContext(VisContext);

  if (visData === undefined) {
    throw new Error('Missing Vis provider.');
  }

  if (typeof visData === 'string' || typeof visData === 'number') {
    throw new Error('visData is not a DataArray !');
  }

  return visData;
}

export function useScalarData(): ScalarData {
  const visData = useContext(VisContext);

  if (visData === undefined) {
    throw new Error('Missing Vis provider.');
  }

  if (typeof visData !== 'string' && typeof visData !== 'number') {
    throw new Error('visData is not a scalar !');
  }

  return visData;
}

export default VisProvider;
