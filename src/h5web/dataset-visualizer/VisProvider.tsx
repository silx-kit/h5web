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

    if (rawDims.length === 0) {
      return rawValues;
    }

    return ndarray(rawValues.flat(Infinity), rawDims);
  }, [rawDims, rawValues]);

  const visValues = useMemo(() => {
    if (values === undefined) {
      return undefined;
    }
    if (mapperState === undefined) {
      return values;
    }

    const slicingIndices = mapperState.map((val) =>
      isNumber(val) ? val : null
    );

    const xIsBeforeY =
      mapperState.includes('y') &&
      mapperState.indexOf('x') < mapperState.indexOf('y');

    const viewOfDataArray = xIsBeforeY
      ? values.pick(...slicingIndices).transpose(1, 0)
      : values.pick(...slicingIndices);

    // Create a new ndarray with the data from the view and its shape
    return ndarray(unpack(viewOfDataArray).flat(), viewOfDataArray.shape);
  }, [mapperState, values]);

  if (visValues === undefined) {
    return <></>;
  }

  return (
    <VisContext.Provider value={visValues}>{children}</VisContext.Provider>
  );
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
