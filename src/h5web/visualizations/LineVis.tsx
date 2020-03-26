import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import AutoSizer from 'react-virtualized-auto-sizer';

import styles from './LineVis.module.css';

interface Props {
  data: number[];
}

function LineVis(props: Props): JSX.Element {
  const { data } = props;

  const chartData = useMemo(() => {
    return data.map((val, index) => ({ x: index + 1, y: val }));
  }, [data]);

  return (
    <AutoSizer>
      {({ width, height }) => (
        <LineChart
          className={styles.chart}
          data={chartData}
          width={width}
          height={height}
          margin={{ top: 32, right: 32, bottom: 16 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" />
          <YAxis />
          <Tooltip />
          <Line dataKey="y" dot={false} isAnimationActive={false} />
        </LineChart>
      )}
    </AutoSizer>
  );
}

export default LineVis;
