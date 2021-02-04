import { ReactElement, useEffect, useMemo } from 'react';
import HeatmapVis from './HeatmapVis';
import { useBaseArray, useDatasetValue, useMappedArray } from '../hooks';
import { useHeatmapConfig } from './config';
import type { AxisMapping } from '../models';
import { getDomain } from '../utils';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { Dataset } from '../../../providers/models';
import type {
  HDF5NumericType,
  HDF5SimpleShape,
} from '../../../providers/hdf5-models';

interface Props {
  dataset: Dataset<HDF5SimpleShape, HDF5NumericType>;
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title?: string;
}

function MappedHeatmapVis(props: Props): ReactElement {
  const { dataset, dims, dimMapping, axisMapping = [], title } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    keepAspectRatio,
    showGrid,
    setDataDomain,
  } = useHeatmapConfig();

  const value = useDatasetValue(dataset);
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
