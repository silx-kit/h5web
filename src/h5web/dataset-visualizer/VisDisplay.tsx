import React, { ReactElement } from 'react';
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

interface Props {
  activeVis: Vis;
  dataset: HDF5Dataset;
  value: HDF5Value;
  loading: boolean;
  mapperState: DimensionMapping;
  onMapperStateChange(mapperState: DimensionMapping): void;
}

function VisDisplay(props: Props): ReactElement {
  const {
    activeVis,
    dataset,
    value,
    loading,
    mapperState,
    onMapperStateChange,
  } = props;

  const { Component: VisComponent } = VIS_DEFS[activeVis];

  return (
    <>
      <DimensionMapper
        activeVis={activeVis}
        rawDims={(dataset.shape as HDF5SimpleShape).dims}
        mapperState={mapperState}
        onChange={onMapperStateChange}
      />
      {loading ? (
        <Loader message="Loading dataset" />
      ) : (
        value !== undefined && (
          <Profiler id={activeVis}>
            <VisComponent
              value={value}
              dataset={dataset}
              mapperState={mapperState}
            />
          </Profiler>
        )
      )}
    </>
  );
}

export default VisDisplay;
