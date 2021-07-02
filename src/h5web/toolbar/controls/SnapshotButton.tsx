import { MdCameraAlt } from 'react-icons/md';
import DownloadBtn from './DownloadBtn';

function SnapshotButton() {
  return (
    <DownloadBtn
      label="Snapshot"
      icon={MdCameraAlt}
      filename="snapshot"
      getDownloadUrl={() => {
        // Create data URL from canvas (if rendered)
        const canvas = document.querySelector('canvas');
        return canvas?.toDataURL() || false;
      }}
    />
  );
}

export default SnapshotButton;
