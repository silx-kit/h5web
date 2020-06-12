import React, { ReactElement } from 'react';
import type { Vis, DimensionMapping } from './models';
import VisProvider from './VisProvider';
import type { HDF5Dataset } from '../providers/models';
import { VIS_DEFS } from '../visualizations';

interface Props {
  key: string; // reset states when switching between datasets
  activeVis: Vis;
  dataset: HDF5Dataset;
  mapperState: DimensionMapping | undefined;
}

function VisDisplay(props: Props): ReactElement {
  const { activeVis, dataset, mapperState } = props;
  const VisComponent = VIS_DEFS[activeVis].Component;

  return (
    <>
      <VisProvider
        activeVis={activeVis}
        mapperState={mapperState}
        dataset={dataset}
      >
        <VisComponent />
      </VisProvider>
    </>
  );
}

export default VisDisplay;
