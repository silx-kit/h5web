import type { Domain, NumArray } from '@h5web/shared';
import { assertLength, assertDefined, ScaleType } from '@h5web/shared';
import { toArray } from 'lodash';
import type { NdArray } from 'ndarray';
import type { ReactNode } from 'react';

import DefaultInteractions from '../../interactions/DefaultInteractions';
import type { Interactions } from '../../interactions/models';
import ResetZoomButton from '../../toolbar/floating/ResetZoomButton';
import ColorBar from '../heatmap/ColorBar';
import type { ColorMap } from '../heatmap/models';
import { useAxisDomain } from '../hooks';
import VisCanvas from '../shared/VisCanvas';
import ScatterPoints from './ScatterPoints';
import styles from './ScatterVis.module.css';
import type { ScatterAxisParams } from './models';

interface Props {
  abscissaParams: ScatterAxisParams;
  ordinateParams: ScatterAxisParams;
  dataArray: NdArray<NumArray>;
  domain: Domain;
  colorMap: ColorMap;
  invertColorMap?: boolean;
  scaleType?: ScaleType;
  showGrid?: boolean;
  title?: string;
  size?: number;
  children?: ReactNode;
  interactions?: Interactions;
}

function ScatterVis(props: Props) {
  const {
    abscissaParams,
    ordinateParams,
    dataArray,
    domain,
    colorMap,
    invertColorMap = false,
    scaleType = ScaleType.Linear,
    showGrid = true,
    title,
    size = 10,
    children,
    interactions,
  } = props;

  const {
    value: abscissaValue,
    label: abscissaLabel,
    scaleType: abscissaScaleType,
  } = abscissaParams;
  const {
    value: ordinateValue,
    label: ordinateLabel,
    scaleType: ordinateScaleType,
  } = ordinateParams;

  assertLength(abscissaValue, dataArray.size, 'abscissa');
  assertLength(ordinateValue, dataArray.size, 'ordinates');

  const abscissas = toArray(abscissaValue);
  const ordinates = toArray(ordinateValue);

  const abscissaDomain = useAxisDomain(abscissas, abscissaScaleType, 0.01);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');
  const ordinateDomain = useAxisDomain(ordinates, ordinateScaleType, 0.01);
  assertDefined(ordinateDomain, 'Ordinates have undefined domain');

  return (
    <figure className={styles.root} aria-label={title} data-keep-canvas-colors>
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
      >
        <DefaultInteractions
          interactions={{ XAxisZoom: false, YAxisZoom: false, ...interactions }}
        />
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
        />

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
