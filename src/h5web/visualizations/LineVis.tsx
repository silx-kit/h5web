import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { useMeasure } from 'react-use';
import styles from './LineVis.module.css';

interface Props {
  data: number[];
}

function LineVis(props: Props): JSX.Element {
  const { data } = props;

  const [divRef, { width, height }] = useMeasure();
  const isVisible = width > 0 && height > 0;

  const chartData = useMemo(() => {
    return data.map((val, index) => ({ x: index + 1, y: val }));
  }, [data]);

  return (
    <div ref={divRef} className={styles.root}>
      {isVisible && (
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
    </div>
  );
}

export default LineVis;
