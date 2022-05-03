import { ToggleGroup, ToggleBtn, LinkBtn, Separator, Btn } from '@h5web/lib';
import { useEventListener, useToggle } from '@react-hookz/web';
import {
  FiMaximize,
  FiMessageCircle,
  FiMinimize,
  FiSidebar,
} from 'react-icons/fi';

import { useDataContext } from '../providers/DataProvider';
import Breadcrumbs from './Breadcrumbs';
import styles from './BreadcrumbsBar.module.css';
import type { FeedbackContext } from './models';

interface Props {
  path: string;
  isExplorerOpen: boolean;
  isInspecting: boolean;
  onToggleExplorer: () => void;
  onChangeInspecting: (b: boolean) => void;
  onSelectPath: (path: string) => void;
  getFeedbackURL?: (context: FeedbackContext) => string;
}

function BreadcrumbsBar(props: Props) {
  const {
    path,
    isExplorerOpen,
    isInspecting,
    onToggleExplorer,
    onChangeInspecting,
    onSelectPath,
    getFeedbackURL,
  } = props;

  const { filepath } = useDataContext();

  const [isFullscreen, toggleFullScreen] = useToggle(
    !!document.fullscreenElement
  );
  useEventListener(document.documentElement, 'fullscreenchange', () => {
    toggleFullScreen();
  });

  return (
    <div className={styles.bar}>
      <ToggleBtn
        label="Toggle explorer sidebar"
        icon={FiSidebar}
        iconOnly
        value={isExplorerOpen}
        onToggle={onToggleExplorer}
      />

      <Separator style={{ marginLeft: '0.375rem', marginRight: '0.875rem' }} />

      <Breadcrumbs
        path={path}
        onSelect={onSelectPath}
        showFilename={!isExplorerOpen}
      />

      <ToggleGroup
        role="tablist"
        ariaLabel="Viewer mode"
        value={String(isInspecting)}
        onChange={(val) => {
          onChangeInspecting(val === 'true' || false);
        }}
      >
        <ToggleGroup.Btn label="Display" value="false" />
        <ToggleGroup.Btn label="Inspect" value="true" />
      </ToggleGroup>

      {document.fullscreenEnabled && (
        <Btn
          icon={isFullscreen ? FiMinimize : FiMaximize}
          iconOnly
          label="Go full screen"
          onClick={() => {
            if (!document.fullscreenElement) {
              void document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
              void document.exitFullscreen();
            }
          }}
        />
      )}

      <Separator />

      {getFeedbackURL && (
        <LinkBtn
          label="Feedback"
          icon={FiMessageCircle}
          href="/" // replaced dynamically
          target="_blank"
          onClick={(evt) => {
            const feedbackUrl = getFeedbackURL({
              filePath: filepath,
              entityPath: path,
            });

            evt.currentTarget.setAttribute('href', feedbackUrl);
          }}
        />
      )}
    </div>
  );
}

export default BreadcrumbsBar;
