import React, { ReactElement, useContext, useEffect } from 'react';
import { useSetState, useTimeoutFn } from 'react-use';
import type { Vis, DimensionMapping } from './models';
import type {
  HDF5Dataset,
  HDF5SimpleShape,
  HDF5Value,
} from '../providers/models';
import { VIS_DEFS } from '../visualizations';
import DimensionMapper from './mapper/DimensionMapper';
import Profiler from '../Profiler';
import Loader from './Loader';
import { ProviderContext } from '../providers/context';

interface Props {
  activeVis: Vis;
  dataset: HDF5Dataset;
}

interface State {
  mapperState: DimensionMapping;
  value?: HDF5Value;
  loading?: boolean;
}

function VisDisplay(props: Props): ReactElement {
  const { activeVis, dataset } = props;

  const [{ value, loading, mapperState }, mergeState] = useSetState<State>({
    mapperState: VIS_DEFS[activeVis].defaultMappingState(dataset),
  });

  const { getValue } = useContext(ProviderContext);
  const [scheduleLoadingFlag, cancelLoadingFlag] = useTimeoutFn(() => {
    mergeState({ loading: true });
  }, 50);

  // Fetch dataset value asynchronously
  useEffect(() => {
    scheduleLoadingFlag(); // in case retrieving value takes too long (e.g. initial fetch of `SilxProvider`)

    getValue(dataset.id).then((val) => {
      cancelLoadingFlag();
      mergeState({ value: val, loading: false });
    });
  }, [cancelLoadingFlag, dataset, getValue, mergeState, scheduleLoadingFlag]);

  const { Component: VisComponent } = VIS_DEFS[activeVis];
  const rawDims = (dataset.shape as HDF5SimpleShape).dims;

  return (
    <>
      <DimensionMapper
        activeVis={activeVis}
        rawDims={rawDims}
        mapperState={mapperState}
        onChange={(nextMapperState) => {
          mergeState({ mapperState: nextMapperState });
        }}
      />
      {loading ? (
        <Loader message="Loading dataset" />
      ) : (
        value !== undefined && (
          <Profiler id={activeVis}>
            <VisComponent
              value={value}
              rawDims={rawDims}
              mapperState={mapperState}
            />
          </Profiler>
        )
      )}
    </>
  );
}

export default VisDisplay;
