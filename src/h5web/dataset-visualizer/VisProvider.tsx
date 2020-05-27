import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { DimensionMapping } from './models';
import { HDF5Dataset, HDF5Value } from '../providers/models';
import { useValue } from '../providers/hooks';
import { isSimpleShape } from '../providers/utils';

export interface VisProps {
  mapping: DimensionMapping;
  rawValues: HDF5Value;
  rawDims: number[];
}

export const VisContext = createContext<VisProps | undefined>(undefined);

type Props = {
  mapping: DimensionMapping;
  dataset: HDF5Dataset;
  children: ReactNode;
};

function VisProvider(props: Props): ReactElement {
  const { dataset, mapping, children } = props;
  const rawValues = useValue(dataset.id);
  const rawDims = isSimpleShape(dataset.shape) ? dataset.shape.dims : [];

  if (rawValues === undefined) {
    return <></>;
  }

  return (
    <VisContext.Provider value={{ rawValues, rawDims, mapping }}>
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

export function useFlatValues(): number[] {
  const { rawValues } = useVisProps();

  return useMemo(() => rawValues.flat(Infinity), [rawValues]);
}

export default VisProvider;
