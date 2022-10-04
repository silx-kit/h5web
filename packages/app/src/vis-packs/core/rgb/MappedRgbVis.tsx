import { RgbVis } from '@h5web/lib';
import type { TypedArray } from 'ndarray';
import { createPortal } from 'react-dom';

import { useBaseArray } from '../hooks';
import RgbToolbar from './RgbToolbar';
import type { RgbVisConfig } from './config';

interface Props {
  value: number[] | TypedArray;
  dims: number[];
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: RgbVisConfig;
}

function MappedRgbVis(props: Props) {
  const { value, dims, title, toolbarContainer, config } = props;
  const { showGrid, layout, imageType } = config;

  const dataArray = useBaseArray(value, dims);

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
