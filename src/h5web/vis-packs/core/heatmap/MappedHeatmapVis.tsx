import { ReactElement, useEffect, useMemo, useState } from 'react';
import type { HDF5Value } from '../../../providers/hdf5-models';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import HeatmapVis from './HeatmapVis';
import { assertArray } from '../../../guards';
import { useBaseArray, useMappedArray } from '../hooks';
import { useHeatmapConfig } from './config';
import type { AxisMapping } from '../models';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { getDomain } from '../utils';

interface Props {
  value: HDF5Value;
  dims: number[];
  title?: string;
  axisMapping?: AxisMapping;
}

function MappedHeatmapVis(props: Props): ReactElement {
  const { value, axisMapping = [], title, dims } = props;
  assertArray<number>(value);

  const {
    customDomain,
    colorMap,
    scaleType,
    keepAspectRatio,
    showGrid,
    setDataDomain,
  } = useHeatmapConfig();

  const [dimensionMapping, setDimensionMapping] = useState<DimensionMapping>([
    ...new Array(dims.length - 2).fill(0),
    'y',
    'x',
  ]);

  const baseArray = useBaseArray(value, dims);
  const dataArray = useMappedArray(baseArray, dimensionMapping);

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
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimensionMapping}
        onChange={setDimensionMapping}
      />
      <HeatmapVis
        dataArray={dataArray}
        title={title}
        domain={domain}
        colorMap={colorMap}
        scaleType={scaleType}
        keepAspectRatio={keepAspectRatio}
        showGrid={showGrid}
        abscissaParams={axisMapping[dimensionMapping.indexOf('x')]}
        ordinateParams={axisMapping[dimensionMapping.indexOf('y')]}
      />
    </>
  );
}

export default MappedHeatmapVis;
