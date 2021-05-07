import { useMemo } from 'react';
import MatrixVis from './MatrixVis';
import { useDatasetValue, useMappedArray } from '../hooks';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { Dataset, ArrayShape } from '../../../providers/models';
import { isAxis } from '../../../dimension-mapper/utils';
import type { PrintableType } from '../models';
import { format } from 'd3-format';
import { isComplexArray } from '../../../guards';
import { renderComplex } from '../../../metadata-viewer/utils';

interface Props {
  dataset: Dataset<ArrayShape, PrintableType>;
  dims: number[];
  dimMapping: DimensionMapping;
}

function MappedMatrixVis(props: Props) {
  const { dataset, dims, dimMapping } = props;

  const value = useDatasetValue(dataset, dimMapping);

  const [slicedDims, slicedMapping] = useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter((dim) => isAxis(dim)),
    ],
    [dimMapping, dims]
  );

  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  if (isComplexArray(dataset.type, mappedArray)) {
    return (
      <MatrixVis
        dataArray={mappedArray}
        formatter={(dataValue) => renderComplex(dataValue, '.2e')}
        cellWidth={232} // To accommodate the longer complex numbers
      />
    );
  }

  return (
    <MatrixVis
      dataArray={mappedArray}
      formatter={(dataValue) => {
        return typeof dataValue === 'number'
          ? format('.3e')(dataValue)
          : dataValue.toString();
      }}
      cellWidth={116}
    />
  );
}

export default MappedMatrixVis;
