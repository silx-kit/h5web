import React, { ReactElement, useCallback } from 'react';
import { Dom, PointerEvent, useThree } from 'react-three-fiber';
import { TooltipWithBounds, useTooltip } from '@vx/tooltip';
import { scaleLinear } from 'd3-scale';
import { format } from 'd3-format';
import styles from './HeatmapVis.module.css';

interface Props {
  data: number[][];
  dims: [number, number];
}

function Tooltip(props: Props): ReactElement {
  const { data, dims } = props;
  const [rows, cols] = dims;

  const { camera, size, intersect } = useThree();
  const { width, height } = size;

  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    tooltipData,
    showTooltip,
    hideTooltip,
  } = useTooltip<[number, number]>();

  // Scales to compute data coordinates from unprojected mesh coordinates
  const xCoordScale = scaleLinear()
    .domain([-width / 2, width / 2])
    .range([0, cols]);
  const yCoordScale = scaleLinear()
    .domain([-height / 2, height / 2])
    .range([0, rows]);

  // Update tooltip when pointer moves
  // When panning, events are handled and stopped by texture mesh and do not reach this mesh (which is behind)
  const onPointerMove = useCallback(
    (evt: PointerEvent) => {
      const { zoom } = camera;
      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());

      const xCoord = Math.floor(xCoordScale(evt.unprojectedPoint.x));
      const yCoord = Math.floor(yCoordScale(evt.unprojectedPoint.y));

      showTooltip({
        tooltipLeft: projectedPoint.x * zoom + width / 2,
        tooltipTop: -projectedPoint.y * zoom + height / 2,
        tooltipData: [xCoord, yCoord],
      });
    },
    [yCoordScale, camera, height, xCoordScale, showTooltip, width]
  );

  // Hide tooltip when pointer leaves mesh or user starts panning
  const onPointerOut = useCallback(hideTooltip, [hideTooltip]);
  const onPointerDown = useCallback(hideTooltip, [hideTooltip]);

  // Trigger `pointermove` when user stops panning to show tooltip if pointer still intersects with mesh
  const onPointerUp = useCallback(intersect, [intersect]);

  return (
    <>
      <mesh {...{ onPointerMove, onPointerOut, onPointerDown, onPointerUp }}>
        <planeBufferGeometry attach="geometry" args={[width, height]} />
      </mesh>
      <Dom style={{ width, height }}>
        {tooltipOpen && tooltipData ? (
          <TooltipWithBounds
            key={Math.random()}
            className={styles.tooltip}
            top={tooltipTop}
            left={tooltipLeft}
          >
            {`x=${tooltipData[0]}, y=${tooltipData[1]}`}
            <span className={styles.tooltipValue}>
              {format('.3')(data[tooltipData[1]][tooltipData[0]])}
            </span>
          </TooltipWithBounds>
        ) : (
          <></>
        )}
      </Dom>
    </>
  );
}

export default Tooltip;
