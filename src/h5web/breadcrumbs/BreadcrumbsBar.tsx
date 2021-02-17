import type { ReactElement } from 'react';
import { FiSidebar } from 'react-icons/fi';
import styles from './BreadcrumbsBar.module.css';
import ToggleGroup from '../toolbar/controls/ToggleGroup';
import ToggleBtn from '../toolbar/controls/ToggleBtn';
import Breadcrumbs from './Breadcrumbs';

interface Props {
  path: string;
  isExplorerOpen: boolean;
  isInspecting: boolean;
  onToggleExplorer: () => void;
  onChangeInspecting: (b: boolean) => void;
  setSelectedPath: (path: string) => void;
}

function BreadcrumbsBar(props: Props): ReactElement {
  const {
    path,
    isExplorerOpen,
    isInspecting,
    onToggleExplorer,
    onChangeInspecting,
    setSelectedPath,
  } = props;

  return (
    <div className={styles.bar}>
      <ToggleBtn
        label="Toggle explorer sidebar"
        icon={FiSidebar}
        iconOnly
        value={isExplorerOpen}
        onChange={onToggleExplorer}
      />

      <Breadcrumbs
        path={path}
        onSelect={setSelectedPath}
        showFilepath={!isExplorerOpen}
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
