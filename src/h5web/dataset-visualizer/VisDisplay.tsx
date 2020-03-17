import React from 'react';
import {
  HDF5Value,
  HDF5Entity,
  HDF5Collection,
  HDF5SimpleShape,
} from '../providers/models';
import { Vis } from './models';
import RawVis from './vis/RawVis';
import MatrixVis from './vis/MatrixVis';

interface Props {
  vis: Vis;
  dataset: HDF5Entity<HDF5Collection.Datasets>;
  value: HDF5Value;
}

function VisDisplay(props: Props): JSX.Element {
  const { vis, dataset, value } = props;

  if (vis === Vis.Raw) {
    return <RawVis data={value} />;
  }

  if (vis === Vis.Matrix) {
    return (
      <MatrixVis dims={(dataset.shape as HDF5SimpleShape).dims} data={value} />
    );
  }

  throw new Error('Visualization not supported');
}

export default VisDisplay;
