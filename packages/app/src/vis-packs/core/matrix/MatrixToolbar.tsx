import { DownloadBtn, Separator, ToggleBtn, Toolbar } from '@h5web/lib';
import type { Primitive, PrintableType } from '@h5web/shared';
import type { NdArray } from 'ndarray';
import { FiAnchor, FiDownload } from 'react-icons/fi';

import { useMatrixVisConfig } from './config';
import { sliceToCsv } from './utils';

interface Props {
  currentSlice: NdArray<Primitive<PrintableType>[]> | undefined;
}

function MatrixToolbar(props: Props) {
  const { currentSlice } = props;
  const { sticky, toggleSticky } = useMatrixVisConfig();

  if (currentSlice && currentSlice.shape.length > 2) {
    throw new Error('Expected current slice to have at most two dimensions');
  }

  return (
    <Toolbar>
      <ToggleBtn
        label="Freeze indices"
        icon={FiAnchor}
        value={sticky}
        onToggle={toggleSticky}
      />

      <Separator />

      {currentSlice && (
        <DownloadBtn
          icon={FiDownload}
          label="CSV"
          filename="export.csv"
          getDownloadUrl={() => {
            const data = sliceToCsv(currentSlice);
            return URL.createObjectURL(
              new Blob([data], { type: 'text/csv;charset=utf-8' })
            );
          }}
        />
      )}
    </Toolbar>
  );
}

export default MatrixToolbar;
