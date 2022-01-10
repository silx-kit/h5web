import { MdCameraAlt } from 'react-icons/md';

import LinkBtn from './LinkBtn';

function SnapshotBtn() {
  return (
    <LinkBtn
      label="Snapshot"
      icon={MdCameraAlt}
      href="/" // placeholder replaced dynamically on click
      target="_blank"
      download="snapshot"
      onClick={(evt) => {
        // Create data URL from canvas (if rendered)
        const canvas = document.querySelector('canvas');
        const url = canvas?.toDataURL();

        if (!url) {
          evt.preventDefault();
          return;
        }

        evt.currentTarget.setAttribute('href', url);
      }}
    />
  );
}

export default SnapshotBtn;
