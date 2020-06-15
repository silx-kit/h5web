import React, { ReactElement, useMemo, ElementType } from 'react';
import { isNumber } from 'lodash-es';
import ndarray from 'ndarray';
import unpack from 'ndarray-unpack';
import type { DimensionMapping } from '../../dataset-visualizer/models';
import type { HDF5Dataset, HDF5SimpleShape } from '../../providers/models';

type Props<T> = {
  component: ElementType<{ dataArray: ndarray<T> }>;
  dataset: HDF5Dataset;
  value: T[];
  mapperState: DimensionMapping;
};

function MappedVis<T>(props: Props<T>): ReactElement {
  const { component: Component, dataset, value, mapperState } = props;
  const rawDims = (dataset.shape as HDF5SimpleShape).dims;

  const dataArray = useMemo(() => {
    const baseArray = ndarray<T>(value.flat(Infinity) as T[], rawDims);

    if (mapperState === undefined) {
      return baseArray;
    }

    const isXBeforeY =
      mapperState.includes('y') &&
      mapperState.indexOf('x') < mapperState.indexOf('y');

    const slicingState = mapperState.map((val) => (isNumber(val) ? val : null));
    const slicedView = baseArray.pick(...slicingState);
    const mappedView = isXBeforeY ? slicedView.transpose(1, 0) : slicedView;

    // Create ndarray from mapped view so `dataArray.data` only contains values relevant to vis
    return ndarray<T>(unpack(mappedView).flat(), mappedView.shape);
  }, [value, rawDims, mapperState]);

  return <Component dataArray={dataArray} />;
}

export default MappedVis;
