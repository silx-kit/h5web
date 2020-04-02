import React from 'react';
import { HDF5SimpleShape, HDF5Dataset } from '../providers/models';
import { Vis } from './models';
import {
  RawVis,
  ScalarVis,
  MatrixVis,
  LineVis,
  HeatmapVis,
} from '../visualizations';
import { useValue } from '../providers/hooks';

interface Props {
  vis: Vis;
  dataset: HDF5Dataset;
}

function VisDisplay(props: Props): JSX.Element {
  const { vis, dataset } = props;
  const value = useValue(dataset.id);

  if (value === undefined) {
    return <></>;
  }

  if (vis === Vis.Raw) {
    return <RawVis data={value} />;
  }

  if (vis === Vis.Scalar) {
    return <ScalarVis data={value} />;
  }

  if (vis === Vis.Matrix) {
    return (
      <MatrixVis dims={(dataset.shape as HDF5SimpleShape).dims} data={value} />
    );
  }

  if (vis === Vis.Line) {
    return <LineVis data={value} />;
  }

  if (vis === Vis.Heatmap) {
    return (
      <HeatmapVis
        dims={(dataset.shape as HDF5SimpleShape).dims as [number, number]}
        data={value}
      />
    );
  }

  throw new Error('Visualization not supported');
}

export default VisDisplay;
