import React from 'react';
import { Vis } from './models';
import HeatmapToolbar from '../visualizations/heatmap/HeatmapToolbar';

interface Props {
  vis?: Vis;
}

function VisToolbar(props: Props): JSX.Element {
  const { vis } = props;

  if (vis === Vis.Heatmap) {
    return <HeatmapToolbar />;
  }
  return <></>;
}

export default VisToolbar;
