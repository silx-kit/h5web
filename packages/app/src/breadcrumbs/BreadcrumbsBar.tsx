import { ToggleGroup, ToggleBtn, LinkBtn, Separator } from '@h5web/lib';
import { useContext } from 'react';
import { FiMessageCircle, FiSidebar } from 'react-icons/fi';

import { ProviderContext } from '../providers/context';
import Breadcrumbs from './Breadcrumbs';
import styles from './BreadcrumbsBar.module.css';
import { prepareFeedback } from './utils';

interface Props {
  path: string;
  isExplorerOpen: boolean;
  isInspecting: boolean;
  onToggleExplorer: () => void;
  onChangeInspecting: (b: boolean) => void;
  onSelectPath: (path: string) => void;
}

function BreadcrumbsBar(props: Props) {
  const {
    path,
    isExplorerOpen,
    isInspecting,
    onToggleExplorer,
    onChangeInspecting,
    onSelectPath,
  } = props;

  const { filepath } = useContext(ProviderContext);

  return (
    <div className={styles.bar}>
      <ToggleBtn
        label="Toggle explorer sidebar"
        icon={FiSidebar}
        iconOnly
        value={isExplorerOpen}
        onToggle={onToggleExplorer}
      />

      <Separator />

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

      <Breadcrumbs
        path={path}
        onSelect={onSelectPath}
        showFilename={!isExplorerOpen}
      />

      <LinkBtn
        label="Give feedback"
        icon={FiMessageCircle}
        href={`mailto:h5web@esrf.fr?subject=Feedback&body=${encodeURIComponent(
          prepareFeedback(filepath, path)
        )}`}
      />
    </div>
  );
}

export default BreadcrumbsBar;
