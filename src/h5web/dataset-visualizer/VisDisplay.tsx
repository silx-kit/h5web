import React, { useState } from 'react';
import { range } from 'lodash-es';
import { Vis, DimensionMapping } from './models';
import DimensionMapper from './DimensionMapper';
import VisProvider from './VisProvider';
import { HDF5Dataset } from '../providers/models';
import { isSimpleShape } from '../providers/utils';
import { VIS_DEFS } from '../visualizations';

interface Props {
  key: string; // reset states when switching between datasets
  activeVis: Vis;
  dataset: HDF5Dataset;
}

function VisDisplay(props: Props): JSX.Element {
  const { activeVis, dataset } = props;
  const { Component: VisComponent } = VIS_DEFS[activeVis];

  const datasetDims = isSimpleShape(dataset.shape) ? dataset.shape.dims : [];
  const [dimensionMapping, setMapping] = useState<DimensionMapping>({
    x: 0,
    slicingIndices: range(1, datasetDims.length).reduce((acc, dimIndex) => {
      return { ...acc, [dimIndex]: 0 };
    }, {}),
  });

  return (
    <VisProvider mapping={dimensionMapping} dataset={dataset}>
      <DimensionMapper activeVis={activeVis} onChange={setMapping} />
      <VisComponent />
    </VisProvider>
  );
}

export default VisDisplay;
