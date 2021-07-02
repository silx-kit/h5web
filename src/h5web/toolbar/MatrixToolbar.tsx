import { FiDownload } from 'react-icons/fi';
import { useMatrixConfig } from '../vis-packs/core/matrix/config';
import { sliceToCsv } from '../vis-packs/core/matrix/utils';
import DownloadBtn from './controls/DownloadBtn';
import Toolbar from './Toolbar';

function MatrixToolbar() {
  const currentSlice = useMatrixConfig((state) => state.currentSlice);
  if (currentSlice && currentSlice.shape.length > 2) {
    throw new Error('Expected current slice to have at most two dimensions');
  }

  return (
    <Toolbar>
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
