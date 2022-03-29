import type { Domain, NumArray } from '@h5web/shared';
import { assertLength, assertDefined, ScaleType } from '@h5web/shared';
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

interface Props {
  dataAbscissas: number[];
  dataOrdinates: number[];
  dataArray: NdArray<NumArray>;
  domain: Domain;
  colorMap: ColorMap;
  invertColorMap?: boolean;
  abscissaLabel?: string;
  ordinateLabel?: string;
  scaleType?: ScaleType;
  showGrid?: boolean;
  title?: string;
  size?: number;
  children?: ReactNode;
  interactions?: Interactions;
}

function ScatterVis(props: Props) {
  const {
    dataAbscissas: abscissas,
    dataOrdinates: ordinates,
    dataArray,
    domain,
    colorMap,
    invertColorMap = false,
    abscissaLabel,
    ordinateLabel,
    scaleType = ScaleType.Linear,
    showGrid = true,
    title,
    size = 10,
    children,
    interactions,
  } = props;

  assertLength(abscissas, dataArray.size, 'abscissa');
  assertLength(ordinates, dataArray.size, 'ordinates');

  const abscissaDomain = useAxisDomain(abscissas, undefined, 0.01);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');
  const ordinateDomain = useAxisDomain(ordinates, undefined, 0.01);
  assertDefined(ordinateDomain, 'Ordinates have undefined domain');

  return (
    <figure className={styles.root}>
      <VisCanvas
        abscissaConfig={{
          visDomain: abscissaDomain,
          showGrid,
          label: abscissaLabel,
        }}
        ordinateConfig={{
          visDomain: ordinateDomain,
          showGrid,
          label: ordinateLabel,
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
