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

interface Props {
  activeVis: Vis;
  dataset: HDF5Dataset;
  value: HDF5Value;
  mapperState: DimensionMapping;
  onMapperStateChange(mapperState: DimensionMapping): void;
}

function VisDisplay(props: Props): ReactElement {
  const { activeVis, dataset, value, mapperState, onMapperStateChange } = props;
  const { render: renderVis } = VIS_DEFS[activeVis];

  return (
    <>
      <DimensionMapper
        activeVis={activeVis}
        rawDims={(dataset.shape as HDF5SimpleShape).dims}
        mapperState={mapperState}
        onChange={onMapperStateChange}
      />
      {value !== undefined && (
        <Profiler id={activeVis}>
          {renderVis(value, dataset, mapperState)}
        </Profiler>
      )}
    </>
  );
}

export default VisDisplay;
