import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { transpose } from 'd3-array';
import { isNumber } from 'lodash-es';
import type { DimensionMapping, Vis } from './models';
import type { HDF5Dataset, HDF5Value } from '../providers/models';
import { useValue } from '../providers/hooks';
import { isSimpleShape } from '../providers/utils';

export interface VisProps {
  values: HDF5Value;
  rawDims: number[];
  slicingIndices?: number[];
}

export const VisContext = createContext<VisProps | undefined>(undefined);

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

  const xDim = mapperState ? mapperState.indexOf('x') : -1;

  const mappedValues = useMemo(() => {
    if (!rawValues) {
      return undefined;
    }

    if (rawDims.length === 2 && xDim === 0) {
      return transpose(rawValues);
    }

    return rawValues;
  }, [rawValues, rawDims.length, xDim]);

  if (mappedValues === undefined) {
    return <></>;
  }

  return (
    <VisContext.Provider
      value={{
        values: mappedValues,
        rawDims,
        slicingIndices: mapperState && mapperState.filter(isNumber),
      }}
    >
      {children}
    </VisContext.Provider>
  );
}

export function useVisProps(): VisProps {
  const props = useContext(VisContext);

  if (!props) {
    throw new Error('Missing Vis provider.');
  }

  return props;
}

export default VisProvider;
