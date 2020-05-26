import React, { useState } from 'react';
import { range } from 'lodash-es';
import { Vis, DimensionMapping } from './models';
import {
  RawVis,
  ScalarVis,
  MatrixVis,
  LineVis,
  HeatmapVis,
} from '../visualizations';
import DimensionMapper from './DimensionMapper';
import VisProvider from './VisProvider';
import { HDF5Dataset } from '../providers/models';
import { isSimpleShape } from '../providers/utils';

const VIS_COMPONENTS = {
  [Vis.Raw]: RawVis,
  [Vis.Scalar]: ScalarVis,
  [Vis.Matrix]: MatrixVis,
  [Vis.Line]: LineVis,
  [Vis.Heatmap]: HeatmapVis,
};

interface Props {
  key: string; // reset states when switching between datasets
  activeVis: Vis;
  dataset: HDF5Dataset;
}

function VisDisplay(props: Props): JSX.Element {
  const { activeVis, dataset } = props;
  const ActiveVis = VIS_COMPONENTS[activeVis];

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
      <ActiveVis />
    </VisProvider>
  );
}

export default VisDisplay;
