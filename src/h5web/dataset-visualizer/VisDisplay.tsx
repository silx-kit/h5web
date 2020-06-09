import React, { useState } from 'react';
import type { Vis, DimensionMapping } from './models';
import DimensionMapper from './DimensionMapper';
import VisProvider from './VisProvider';
import type { HDF5Dataset } from '../providers/models';
import { isSimpleShape } from '../providers/utils';
import { VIS_DEFS } from '../visualizations';

interface Props {
  key: string; // reset states when switching between datasets
  activeVis: Vis;
  dataset: HDF5Dataset;
}

function VisDisplay(props: Props): JSX.Element {
  const { activeVis, dataset } = props;
  const datasetDims = isSimpleShape(dataset.shape) ? dataset.shape.dims : [];

  const [prevVis, setPrevVis] = useState<Vis>();
  const [mapperState, setMapperState] = useState<DimensionMapping>();

  // Update mapping when vis changes
  // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
  if (activeVis !== prevVis) {
    setPrevVis(activeVis);
    setMapperState(VIS_DEFS[activeVis].defaultMappingState(datasetDims));
  }

  const VisComponent = VIS_DEFS[activeVis].Component;

  return (
    <>
      {mapperState && (
        <DimensionMapper
          activeVis={activeVis}
          rawDims={datasetDims}
          mapperState={mapperState}
          onChange={setMapperState}
        />
      )}
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
