import {
  type Domain,
  type IgnoreValue,
  type NumArray,
  ScaleType,
} from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';
import { type PropsWithChildren, useMemo, useRef } from 'react';

import ColorBar from '../heatmap/ColorBar';
import { type ColorMap } from '../heatmap/models';
import {
  type AxisParams,
  type ClassStyleAttrs,
  type VisScaleType,
} from '../models';
import R3FCanvas from '../shared/R3FCanvas';
import { createScale, DEFAULT_DOMAIN } from '../utils';
import SurfaceAxes, { type SurfaceAxisConfig } from './SurfaceAxes';
import SurfaceControls from './SurfaceControls';
import SurfaceMesh from './SurfaceMesh';
import styles from './SurfaceVis.module.css';
import { getCellCenters, getCoordsDomain, getFootprint } from './utils';

interface Props extends ClassStyleAttrs {
  dataArray: NdArray<NumArray>;
  domain: Domain | undefined;
  colorMap?: ColorMap;
  scaleType?: VisScaleType;
  invertColorMap?: boolean;
  title?: string;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
  valueLabel?: string;
  flipXAxis?: boolean;
  flipYAxis?: boolean;
  keepRatio?: boolean;
  heightScale?: number;
  showAxes?: boolean;
  showGrid?: boolean;
  ignoreValue?: IgnoreValue;
}

function SurfaceVis(props: PropsWithChildren<Props>) {
  const {
    dataArray,
    domain = DEFAULT_DOMAIN,
    colorMap = 'Viridis',
    scaleType = ScaleType.Linear,
    invertColorMap = false,
    title,
    abscissaParams = {},
    ordinateParams = {},
    valueLabel,
    flipXAxis = false,
    flipYAxis = false,
    keepRatio = true,
    heightScale = 0.5,
    showAxes = true,
    showGrid = true,
    ignoreValue,
    children,
    className = '',
    style,
  } = props;

  if (dataArray.shape.length !== 2) {
    throw new Error('Expected two-dimensional array');
  }

  const { label: abscissaLabel, value: abscissaValue } = abscissaParams;
  const { label: ordinateLabel, value: ordinateValue } = ordinateParams;
  const [rows, cols] = dataArray.shape;

  const xCenters = useMemo(
    () => getCellCenters(abscissaValue, cols),
    [abscissaValue, cols],
  );
  const yCenters = useMemo(
    () => getCellCenters(ordinateValue, rows),
    [ordinateValue, rows],
  );

  const xDomain = useMemo(() => getCoordsDomain(xCenters), [xCenters]);
  const yDomain = useMemo(() => getCoordsDomain(yCenters), [yCenters]);
  const [w, h] = getFootprint(xDomain, yDomain, keepRatio);

  const { xCoords, yCoords } = useMemo(() => {
    const xScale = createScale(ScaleType.Linear, {
      domain: xDomain,
      range: flipXAxis ? [w / 2, -w / 2] : [-w / 2, w / 2],
    });
    const yScale = createScale(ScaleType.Linear, {
      domain: yDomain,
      range: flipYAxis ? [h / 2, -h / 2] : [-h / 2, h / 2],
    });

    return {
      xCoords: xCenters.map((x) => xScale(x)),
      yCoords: yCenters.map((y) => yScale(y)),
    };
  }, [xCenters, yCenters, xDomain, yDomain, w, h, flipXAxis, flipYAxis]);

  const abscissaConfig = useMemo<SurfaceAxisConfig>(
    () => ({
      domain: xDomain,
      isIndexAxis: !abscissaValue || abscissaValue.length < cols, // see `getCellCenters`
      label: abscissaLabel,
      flip: flipXAxis,
    }),
    [xDomain, abscissaValue, cols, abscissaLabel, flipXAxis],
  );

  const ordinateConfig = useMemo<SurfaceAxisConfig>(
    () => ({
      domain: yDomain,
      isIndexAxis: !ordinateValue || ordinateValue.length < rows,
      label: ordinateLabel,
      flip: flipYAxis,
    }),
    [yDomain, ordinateValue, rows, ordinateLabel, flipYAxis],
  );

  const resetRef = useRef<() => void>(undefined);

  return (
    <figure
      className={`${styles.root} ${className}`}
      style={style}
      aria-label={title}
      data-keep-canvas-colors
    >
      <div className={styles.main}>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.canvasArea}>
          <R3FCanvas className={styles.canvas}>
            <SurfaceControls resetRef={resetRef} />
            <SurfaceMesh
              values={dataArray}
              xCoords={xCoords}
              yCoords={yCoords}
              domain={domain}
              scaleType={scaleType}
              colorMap={colorMap}
              invertColorMap={invertColorMap}
              ignoreValue={ignoreValue}
              zHeight={heightScale}
            />
            {showAxes && (
              <SurfaceAxes
                footprint={[w, h]}
                zHeight={heightScale}
                abscissaConfig={abscissaConfig}
                ordinateConfig={ordinateConfig}
                valueDomain={domain}
                valueLabel={valueLabel}
                scaleType={scaleType}
                showGrid={showGrid}
              />
            )}
            {children}
          </R3FCanvas>
          <button
            className={styles.resetBtn}
            type="button"
            onClick={() => resetRef.current?.()}
          >
            <span className={styles.btnLike}>Reset view</span>
          </button>
        </div>
      </div>
      <ColorBar
        domain={domain}
        scaleType={scaleType}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        withBounds
      />
    </figure>
  );
}

export type { Props as SurfaceVisProps };
export default SurfaceVis;
