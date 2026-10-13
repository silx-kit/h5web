import { useState } from 'react';
import { MdCameraAlt } from 'react-icons/md';

import { exportSnapshot, findVisElement } from '../../vis/snapshot/render';
import { getSnapshotFilename } from '../../vis/snapshot/utils';
import ActionMenu from './ActionMenu';
import { download } from './utils';

type Target = HTMLElement | null | undefined;

interface Props {
  /* Visualization to snapshot, or a container of it. Recommended when the
   * toolbar is not rendered next to the visualization (e.g. in a portal) or when
   * there are several visualizations on the page. Defaults to the visualization
   * found by walking up the DOM from the button. */
  target?: Target | (() => Target);
  /* Output resolutions offered in the menu, as multiples of `devicePixelRatio` */
  resolutions?: number[];
  /* Defaults to the visualization's title (or `snapshot`) + `.png` */
  filename?: string;
}

function SnapshotBtn(props: Props) {
  const { target, resolutions = [1, 2], filename } = props;
  const [status, setStatus] = useState<'idle' | 'busy' | 'failed'>('idle');

  async function takeSnapshot(resolution: number, menuBtn: HTMLElement | null) {
    const container = typeof target === 'function' ? target() : target;
    const from = container ?? menuBtn;
    const elem = from ? findVisElement(from) : undefined;

    setStatus('busy');
    try {
      if (!elem) {
        throw new Error('No visualization found');
      }

      const scale = resolution * Math.max(1, globalThis.devicePixelRatio || 1);
      await download(
        async () => exportSnapshot(elem, { scale }),
        filename ?? getSnapshotFilename(elem.getAttribute('aria-label') ?? ''),
      );
      setStatus('idle');
    } catch (error) {
      console.error('Snapshot failed:', error); // eslint-disable-line no-console
      setStatus('failed');
    }
  }

  return (
    <ActionMenu
      label={status === 'failed' ? 'Snapshot failed' : 'Snapshot'}
      Icon={MdCameraAlt}
      disabled={status === 'busy'}
      actions={resolutions.map((resolution) => ({
        key: String(resolution),
        label: `Save as PNG${resolution === 1 ? '' : ` (${resolution}×)`}`,
        onSelect: (menuBtn) => {
          void takeSnapshot(resolution, menuBtn);
        },
      }))}
    />
  );
}

export type { Props as SnapshotBtnProps };
export default SnapshotBtn;
