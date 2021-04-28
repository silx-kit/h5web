import type ndarray from 'ndarray';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import TooltipMesh from '../shared/TooltipMesh';
import PanZoomMesh from '../shared/PanZoomMesh';
import Mesh from './Mesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims } from './utils';
import { Domain, ScaleType, AxisParams } from '../models';
import type { ColorMap } from './models';
import { DEFAULT_DOMAIN } from '../utils';
import { assertDefined } from '../../../guards';
import { useAxisValues, useTooltipFormatters } from './hooks';
import { useDomain } from '../hooks';

interface Props {
  dataArray: ndarray;
  domain: Domain | undefined;
  colorMap?: ColorMap;
  scaleType?: ScaleType;
  keepAspectRatio?: boolean;
  showGrid?: boolean;
  title?: string;
  invertColorMap?: boolean;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
  alphaArray?: ndarray;
  alphaDomain?: Domain;
}

function HeatmapVis(props: Props) {
  const {
    dataArray,
    domain = DEFAULT_DOMAIN,
    colorMap = 'Viridis',
    scaleType = ScaleType.Linear,
    keepAspectRatio = true,
    showGrid = false,
    invertColorMap = false,
    title,
    abscissaParams = {},
    ordinateParams = {},
    alphaArray,
    alphaDomain,
  } = props;

  const { label: abscissaLabel, value: abscissaValue } = abscissaParams;
  const { label: ordinateLabel, value: ordinateValue } = ordinateParams;

  const { rows, cols } = getDims(dataArray);
  const aspectRatio = keepAspectRatio ? cols / rows : undefined; // width / height <=> cols / rows

  const abscissas = useAxisValues(abscissaValue, cols);
  const abscissaDomain = useDomain(abscissas);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const ordinates = useAxisValues(ordinateValue, rows);
  const ordinateDomain = useDomain(ordinates);
  assertDefined(ordinateDomain, 'Ordinates have undefined domain');

  const tooltipFormatters = useTooltipFormatters(
    abscissas,
    ordinates,
    abscissaLabel,
    ordinateLabel,
    dataArray
  );

  return (
    <figure className={styles.root} aria-labelledby="vis-title">
      <VisCanvas
        abscissaConfig={{
          domain: abscissaDomain,
          showGrid,
          isIndexAxis: !abscissaValue,
          label: abscissaLabel,
        }}
        ordinateConfig={{
          domain: ordinateDomain,
          showGrid,
          isIndexAxis: !ordinateValue,
          label: ordinateLabel,
        }}
        aspectRatio={aspectRatio}
        canvasTitle={title}
      >
        <TooltipMesh {...tooltipFormatters} guides="both" />
        <PanZoomMesh />
        <Mesh
          rows={rows}
          cols={cols}
          values={dataArray.data as number[]}
          domain={domain}
          colorMap={colorMap}
          invertColorMap={invertColorMap}
          scaleType={scaleType}
          alphaValues={alphaArray && (alphaArray.data as number[])}
          alphaDomain={alphaDomain}
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

export type { Props as HeatmapVisProps };
export default HeatmapVis;
