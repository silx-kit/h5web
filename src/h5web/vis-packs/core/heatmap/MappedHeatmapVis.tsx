import { ReactElement, useEffect, useMemo } from 'react';
import type { HDF5Value } from '../../../providers/hdf5-models';
import HeatmapVis from './HeatmapVis';
import { assertArray } from '../../../guards';
import { useBaseArray, useMappedArray } from '../hooks';
import { useHeatmapConfig } from './config';
import type { AxisMapping } from '../models';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { getDomain } from '../utils';
import { useDimMappingState } from '../../hooks';

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

  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

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
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
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
    </>
  );
}

export default MappedHeatmapVis;
