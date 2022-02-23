import { RgbVis } from '@h5web/lib';
import type { TypedArray } from 'ndarray';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import { useBaseArray } from '../hooks';
import RgbToolbar from './RgbToolbar';
import { useRgbConfig } from './config';

interface Props {
  value: number[] | TypedArray;
  dims: number[];
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
}

function MappedRgbVis(props: Props) {
  const { value, dims, title, toolbarContainer } = props;

  const dataArray = useBaseArray(value, dims);

  const { showGrid, layout, imageType } = useRgbConfig(
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
