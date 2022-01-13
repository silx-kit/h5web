import type { Domain } from '@h5web/shared';
import { assertDataLength, ScaleType } from '@h5web/shared';

import ColorBar from '../heatmap/ColorBar';
import type { ColorMap } from '../heatmap/models';
import { useAxisDomain } from '../hooks';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { DEFAULT_DOMAIN } from '../utils';
import ScatterPoints from './ScatterPoints';
import styles from './ScatterVis.module.css';

interface Props {
  dataAbscissas: number[];
  dataOrdinates: number[];
  data: number[];
  domain: Domain;
  colorMap: ColorMap;
  invertColorMap?: boolean;
  scaleType?: ScaleType;
  showGrid?: boolean;
}

function ScatterVis(props: Props) {
  const {
    dataAbscissas: abscissas,
    dataOrdinates: ordinates,
    data,
    domain,
    colorMap,
    invertColorMap = false,
    scaleType = ScaleType.Linear,
    showGrid = true,
  } = props;

  assertDataLength(abscissas, data, 'abscissa');
  assertDataLength(ordinates, data, 'ordinates');

  const abscissaDomain =
    useAxisDomain(abscissas, undefined, 0.01) || DEFAULT_DOMAIN;
  const ordinateDomain =
    useAxisDomain(abscissas, undefined, 0.01) || DEFAULT_DOMAIN;

  return (
    <figure className={styles.root}>
      <VisCanvas
        abscissaConfig={{
          visDomain: abscissaDomain,
          showGrid,
        }}
        ordinateConfig={{
          visDomain: ordinateDomain,
          showGrid,
        }}
      >
        <PanZoomMesh />
        <ScatterPoints
          abscissas={abscissas}
          ordinates={ordinates}
          data={data}
          domain={domain}
          scaleType={scaleType}
          colorMap={colorMap}
          invertColorMap={invertColorMap}
        />
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
