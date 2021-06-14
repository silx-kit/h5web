import type { ReactNode } from 'react';
import type { NdArray } from 'ndarray';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import TooltipMesh from '../shared/TooltipMesh';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims } from './utils';
import { Domain, ScaleType, AxisParams } from '../models';
import type { ColorMap, Layout } from './models';
import { DEFAULT_DOMAIN, getAxisOffsets } from '../utils';
import { assertDefined } from '../../../guards';
import { useAxisValues, useTooltipFormatters } from './hooks';
import { useDomain } from '../hooks';
import Mesh from './Mesh';
import MeshMaterial from './MeshMaterial';
import AxisSystem from '../shared/AxisSystem';

interface Props {
  dataArray: NdArray;
  domain: Domain | undefined;
  colorMap?: ColorMap;
  scaleType?: ScaleType;
  layout?: Layout;
  showGrid?: boolean;
  title?: string;
  invertColorMap?: boolean;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
  alphaArray?: NdArray;
  alphaDomain?: Domain;
  children?: ReactNode;
}

function HeatmapVis(props: Props) {
  const {
    dataArray,
    domain = DEFAULT_DOMAIN,
    colorMap = 'Viridis',
    scaleType = ScaleType.Linear,
    layout = 'cover',
    showGrid = false,
    invertColorMap = false,
    title,
    abscissaParams = {},
    ordinateParams = {},
    alphaArray,
    alphaDomain,
    children,
  } = props;

  const { label: abscissaLabel, value: abscissaValue } = abscissaParams;
  const { label: ordinateLabel, value: ordinateValue } = ordinateParams;

  const { rows, cols } = getDims(dataArray);

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

  const axisOffsets = getAxisOffsets({
    left: !!ordinateLabel,
    bottom: !!abscissaLabel,
    top: !!title,
  });

  return (
    <figure
      className={styles.root}
      aria-labelledby="vis-title"
      data-keep-canvas-colors
    >
      <VisCanvas
        axisOffsets={axisOffsets}
        aspectRatio={layout === 'contain' ? cols / rows : undefined}
      >
        <AxisSystem
          axisOffsets={axisOffsets}
          visRatio={layout === 'cover' ? cols / rows : undefined}
          title={title}
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
        >
          <TooltipMesh {...tooltipFormatters} guides="both" />
          <PanZoomMesh />
          <Mesh>
            <MeshMaterial
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
          </Mesh>
          {children}
        </AxisSystem>
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
