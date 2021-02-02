import { ReactElement, useEffect, useMemo } from 'react';
import HeatmapVis from './HeatmapVis';
import { useBaseArray, useMappedArray } from '../hooks';
import { useHeatmapConfig } from './config';
import type { AxisMapping } from '../models';
import { getDomain } from '../utils';
import type { DimensionMapping } from '../../../dimension-mapper/models';

interface Props {
  value: number[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title?: string;
}

function MappedHeatmapVis(props: Props): ReactElement {
  const { value, dims, dimMapping, axisMapping = [], title } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    keepAspectRatio,
    showGrid,
    setDataDomain,
  } = useHeatmapConfig();

  const baseArray = useBaseArray(value, dims);
  const dataArray = useMappedArray(baseArray, dimMapping);

  const domain = useMemo(() => {
    return customDomain || getDomain(dataArray.data as number[], scaleType);
  }, [customDomain, dataArray, scaleType]);

  useEffect(() => {
    if (!customDomain) {
      // If auto-scale is on, update `dataDomain`
      setDataDomain(domain);
    }
  }, [customDomain, domain, setDataDomain]);

  return (
    <HeatmapVis
      dataArray={dataArray}
      title={title}
      domain={domain}
      colorMap={colorMap}
      scaleType={scaleType}
      keepAspectRatio={keepAspectRatio}
      showGrid={showGrid}
      abscissaParams={axisMapping[dimMapping.indexOf('x')]}
      ordinateParams={axisMapping[dimMapping.indexOf('y')]}
    />
  );
}

export default MappedHeatmapVis;
