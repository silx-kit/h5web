import React from 'react';
import { Vis } from './models';
import HeatmapToolbar from '../visualizations/heatmap/HeatmapToolbar';
import LineToolbar from '../visualizations/line/LineToolbar';

interface Props {
  vis?: Vis;
}

function VisBar(props: Props): JSX.Element {
  const { vis } = props;

  if (vis === Vis.Heatmap) {
    return <HeatmapToolbar />;
  }

  if (vis === Vis.Line) {
    return <LineToolbar />;
  }
  return <></>;
}

export default VisBar;
