import { assertDefined, assertLength } from '@h5web/shared/guards';
import {
  type ColorScaleType,
  type Domain,
  type NumArray,
  ScaleType,
} from '@h5web/shared/vis-models';
import { formatTooltipVal } from '@h5web/shared/vis-utils';
import { type ThreeEvent } from '@react-three/fiber';
import { useTooltip } from '@visx/tooltip';
import { type NdArray } from 'ndarray';
import { type ReactNode } from 'react';

import DefaultInteractions, {
  type DefaultInteractionsConfig,
} from '../../interactions/DefaultInteractions';
import ResetZoomButton from '../../toolbar/floating/ResetZoomButton';
import ColorBar from '../heatmap/ColorBar';
import { type ColorMap } from '../heatmap/models';
import { useAxisDomain } from '../hooks';
import { type ClassStyleAttrs } from '../models';
import TooltipOverlay from '../shared/TooltipOverlay';
import VisCanvas from '../shared/VisCanvas';
import { type ScatterAxisParams } from './models';
import ScatterPoints from './ScatterPoints';
import styles from './ScatterVis.module.css';

interface Props extends ClassStyleAttrs {
  abscissaParams: ScatterAxisParams;
  ordinateParams: ScatterAxisParams;
  dataArray: NdArray<NumArray>;
  domain: Domain;
  colorMap?: ColorMap;
  invertColorMap?: boolean;
  scaleType?: ColorScaleType;
  showGrid?: boolean;
  title?: string;
  size?: number;
  children?: ReactNode;
  interactions?: DefaultInteractionsConfig;
  onPointClick?: (index: number, evt: ThreeEvent<MouseEvent>) => void;
}

function ScatterVis(props: Props) {
  const {
    abscissaParams,
    ordinateParams,
    dataArray,
    domain,
    colorMap = 'Viridis',
    invertColorMap = false,
    scaleType = ScaleType.Linear,
    showGrid = true,
    title,
    size = 10,
    children,
    interactions,
    onPointClick,
    className = '',
    style,
  } = props;

  const {
    value: abscissas,
    label: abscissaLabel,
    scaleType: abscissaScaleType,
  } = abscissaParams;
  const {
    value: ordinates,
    label: ordinateLabel,
    scaleType: ordinateScaleType,
  } = ordinateParams;

  assertLength(abscissas, dataArray.size, 'abscissa');
  assertLength(ordinates, dataArray.size, 'ordinates');

  const abscissaDomain = useAxisDomain(abscissas, abscissaScaleType, 0.01);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');
  const ordinateDomain = useAxisDomain(ordinates, ordinateScaleType, 0.01);
  assertDefined(ordinateDomain, 'Ordinates have undefined domain');

  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    tooltipData: tooltipIndex,
    showTooltip,
    hideTooltip,
  } = useTooltip<number>();

  return (
    <figure
      className={`${styles.root} ${className}`}
      style={style}
      aria-label={title}
      data-keep-canvas-colors
    >
      <VisCanvas
        abscissaConfig={{
          visDomain: abscissaDomain,
          showGrid,
          label: abscissaLabel,
          scaleType: abscissaScaleType,
        }}
        ordinateConfig={{
          visDomain: ordinateDomain,
          showGrid,
          label: ordinateLabel,
          scaleType: ordinateScaleType,
        }}
        title={title}
        // Increase raycaster threshold to match point size
        raycasterThreshold={size}
      >
        <DefaultInteractions {...interactions} />
        <ResetZoomButton />

        <ScatterPoints
          abscissas={abscissas}
          ordinates={ordinates}
          data={dataArray.data}
          domain={domain}
          scaleType={scaleType}
          colorMap={colorMap}
          invertColorMap={invertColorMap}
          size={size}
          onClick={onPointClick}
          onPointerEnter={(index, evt) =>
            showTooltip({
              tooltipData: index,
              tooltipLeft: evt.nativeEvent.offsetX,
              tooltipTop: evt.nativeEvent.offsetY,
            })
          }
          onPointerOut={() => hideTooltip()}
        />
        <TooltipOverlay
          tooltipOpen={tooltipOpen}
          tooltipLeft={tooltipLeft}
          tooltipTop={tooltipTop}
        >
          {tooltipIndex !== undefined && (
            <>
              <span>
                {`${abscissaLabel ?? 'x'} = ${formatTooltipVal(
                  abscissas[tooltipIndex],
                )}, ${ordinateLabel ?? 'y'} = ${formatTooltipVal(
                  ordinates[tooltipIndex],
                )}`}
              </span>
              <div className={styles.tooltipValue}>
                <strong>{formatTooltipVal(dataArray.get(tooltipIndex))}</strong>
              </div>
            </>
          )}
        </TooltipOverlay>

        {children}
      </VisCanvas>

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

export type { Props as ScatterVisProps };
export default ScatterVis;
