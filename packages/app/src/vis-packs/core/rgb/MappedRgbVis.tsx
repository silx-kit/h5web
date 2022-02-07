import { RgbVis } from '@h5web/lib';
import type { TypedArray } from 'ndarray';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import { assertTextureNumArray } from '../heatmap/utils';
import { useBaseArray } from '../hooks';
import RgbToolbar from './RgbToolbar';
import { useRgbVisConfig } from './config';

interface Props {
  value: number[] | TypedArray;
  dims: number[];
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
}

function MappedRgbVis(props: Props) {
  const { value, dims, title, toolbarContainer } = props;

  assertTextureNumArray(value);
  const dataArray = useBaseArray(value, dims);

  const { showGrid, layout, imageType } = useRgbVisConfig(
    (state) => state,
    shallow
  );

  return (
    <>
      {toolbarContainer && createPortal(<RgbToolbar />, toolbarContainer)}
      <RgbVis
        dataArray={dataArray}
        title={title}
        showGrid={showGrid}
        layout={layout}
        imageType={imageType}
      />
    </>
  );
}

export default MappedRgbVis;
