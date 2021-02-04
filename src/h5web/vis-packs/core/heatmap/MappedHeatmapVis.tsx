import { ReactElement, useEffect, useMemo } from 'react';
import HeatmapVis from './HeatmapVis';
import { useBaseArray, useDatasetValue, useMappedArray } from '../hooks';
import { useHeatmapConfig } from './config';
import type { AxisMapping, ScaleType } from '../models';
import { getDomain } from '../utils';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { Dataset } from '../../../providers/models';
import type {
  HDF5NumericType,
  HDF5SimpleShape,
} from '../../../providers/hdf5-models';
import { isAxis } from '../../../dimension-mapper/utils';
import shallow from 'zustand/shallow';

interface Props {
  dataset: Dataset<HDF5SimpleShape, HDF5NumericType>;
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title?: string;
  colorScaleType?: ScaleType;
}

function MappedHeatmapVis(props: Props): ReactElement {
  const {
    dataset,
    dims,
    dimMapping,
    axisMapping = [],
    title,
    colorScaleType,
  } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    keepAspectRatio,
    showGrid,
    setDataDomain,
    setScaleType,
  } = useHeatmapConfig((state) => state, shallow);

  const value = useDatasetValue(dataset, dimMapping);

  const [slicedDims, slicedMapping] = useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter((dim) => isAxis(dim)),
    ],
    [dims, dimMapping]
  );

  const baseArray = useBaseArray(value, slicedDims);
  const dataArray = useMappedArray(baseArray, slicedMapping);

  const domain = useMemo(() => {
    return customDomain || getDomain(dataArray.data as number[], scaleType);
  }, [customDomain, dataArray, scaleType]);

  useEffect(() => {
    if (!customDomain) {
      // If auto-scale is on, update `dataDomain`
      setDataDomain(domain);
    }
  }, [customDomain, domain, setDataDomain]);

  useEffect(() => {
    if (colorScaleType) {
      setScaleType(colorScaleType);
    }
  }, [setScaleType, colorScaleType]);

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
