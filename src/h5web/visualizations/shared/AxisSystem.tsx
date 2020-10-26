import React, { useContext } from 'react';
import { useThree } from 'react-three-fiber';
import Html from './Html';
import styles from './AxisSystem.module.css';
import type { AxisOffsets, Domain } from './models';
import { getAxisScale } from './utils';
import { AxisSystemContext } from './AxisSystemProvider';
import { useFrameRendering } from './hooks';
import Axis from './Axis';

interface Props {
  axisOffsets: AxisOffsets;
  title?: string;
}

function AxisSystem(props: Props): JSX.Element {
  const { axisOffsets, title } = props;

  const { abscissaInfo, ordinateInfo } = useContext(AxisSystemContext);

  const { camera, size } = useThree();
  const { position, zoom } = camera;
  const { width, height } = size;

  const abscissaScale = getAxisScale(abscissaInfo, width);
  const ordinateScale = getAxisScale(ordinateInfo, height);

  // Find visible domains from camera's zoom and position
  const xVisibleDomain: Domain = [
    abscissaScale.invert(-width / (2 * zoom) + position.x),
    abscissaScale.invert(width / (2 * zoom) + position.x),
  ];

  const yVisibleDomain: Domain = [
    ordinateScale.invert(-height / (2 * zoom) + position.y),
    ordinateScale.invert(height / (2 * zoom) + position.y),
  ];

  // Restrain ticks scales to visible domains
  const xTicksScale = abscissaInfo.scaleFn();
  xTicksScale.domain(xVisibleDomain);
  xTicksScale.range([0, width]);

  const yTicksScale = ordinateInfo.scaleFn();
  yTicksScale.domain(yVisibleDomain);
  yTicksScale.range([height, 0]);

  // Re-render on every R3F frame (i.e. on every change of camera zoom/position)
  useFrameRendering();

  return (
    <Html
      className={styles.axisSystem}
      style={{
        // Take over space reserved for axis by VisCanvas
        top: -axisOffsets.top,
        left: -axisOffsets.left,
        width: width + axisOffsets.left + axisOffsets.right,
        height: height + axisOffsets.bottom + axisOffsets.top,
        gridTemplateColumns: `${axisOffsets.left}px 1fr ${axisOffsets.right}px`,
        gridTemplateRows: `${axisOffsets.top}px 1fr ${axisOffsets.bottom}px`,
      }}
    >
      {title && <div className={styles.title}>{title}</div>}
      <Axis
        type="abscissa"
        scale={xTicksScale}
        domain={xVisibleDomain}
        info={abscissaInfo}
        canvasSize={size}
      />
      <Axis
        type="ordinate"
        scale={yTicksScale}
        domain={yVisibleDomain}
        info={ordinateInfo}
        canvasSize={size}
      />
    </Html>
  );
}

export default AxisSystem;
