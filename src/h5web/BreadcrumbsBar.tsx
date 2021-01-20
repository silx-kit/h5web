import { Fragment, ReactElement, useContext } from 'react';
import { FiChevronRight, FiSidebar } from 'react-icons/fi';
import styles from './BreadcrumbsBar.module.css';
import ToggleGroup from './toolbar/controls/ToggleGroup';
import ToggleBtn from './toolbar/controls/ToggleBtn';
import { ProviderContext } from './providers/context';
import { assertAbsolutePath } from './guards';

interface Props {
  path: string;
  isExplorerOpen: boolean;
  isInspecting: boolean;
  onToggleExplorer: () => void;
  onChangeInspecting: (b: boolean) => void;
}

function BreadcrumbsBar(props: Props): ReactElement {
  const {
    path,
    isExplorerOpen,
    isInspecting,
    onToggleExplorer,
    onChangeInspecting,
  } = props;

  assertAbsolutePath(path);

  const { domain } = useContext(ProviderContext);
  const crumbs = [domain, ...`${path === '/' ? '' : path}`.split('/').slice(1)];
  const firstCrumbIndex = isExplorerOpen ? 1 : 0; // skip domain crumb if explorer is open

  return (
    <div className={styles.bar}>
      <ToggleBtn
        label="Toggle explorer sidebar"
        icon={FiSidebar}
        iconOnly
        value={isExplorerOpen}
        onChange={onToggleExplorer}
      />

      <h1 className={styles.breadCrumbs}>
        {crumbs.slice(firstCrumbIndex, -1).map((crumb, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            <span className={styles.crumb}>{crumb}</span>
            <FiChevronRight className={styles.separator} title="/" />
          </Fragment>
        ))}
        <span className={styles.crumb} data-current>
          {crumbs[crumbs.length - 1]}
        </span>
      </h1>

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
