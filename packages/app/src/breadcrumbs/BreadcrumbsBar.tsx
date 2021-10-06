import { ToggleGroup, ToggleBtn } from '@h5web/lib';
import { FiSidebar } from 'react-icons/fi';

import Breadcrumbs from './Breadcrumbs';
import styles from './BreadcrumbsBar.module.css';

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

  return (
    <div className={styles.bar}>
      <ToggleBtn
        label="Toggle explorer sidebar"
        icon={FiSidebar}
        iconOnly
        value={isExplorerOpen}
        onToggle={onToggleExplorer}
      />

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
    </div>
  );
}

export default BreadcrumbsBar;
