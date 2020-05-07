import React from 'react';
import { Vis } from './models';
import HeatmapToolbar from '../visualizations/heatmap/HeatmapToolbar';
import LineVisToolbar from '../visualizations/line/LineVisToolbar';

interface Props {
  vis?: Vis;
}

function VisBar(props: Props): JSX.Element {
  const { vis } = props;

  if (vis === Vis.Heatmap) {
    return <HeatmapToolbar />;
  }

  if (vis === Vis.Line) {
    return <LineVisToolbar />;
  }
  return <></>;
}

export default VisBar;
