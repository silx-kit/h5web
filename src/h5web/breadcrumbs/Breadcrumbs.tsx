import { useContext } from 'react';
import styles from './BreadcrumbsBar.module.css';
import { assertAbsolutePath } from '../guards';
import { ProviderContext } from '../providers/context';
import Crumb from './Crumb';
import CopyableCrumb from './CopyableCrumb';

interface Props {
  path: string;
  onSelect: (path: string) => void;
  showFilename: boolean;
}

function Breadcrumbs(props: Props) {
  const { path, onSelect, showFilename } = props;

  assertAbsolutePath(path);
  const { filename } = useContext(ProviderContext);

  if (path === '/') {
    return (
      <h1 className={styles.breadCrumbs}>
        <span className={styles.crumb} data-current>
          {filename}
        </span>
      </h1>
    );
  }

  // Remove leading /
  const crumbs = path.slice(1).split('/');

  return (
    <h1 className={styles.breadCrumbs}>
      {showFilename && <Crumb name={filename} onClick={() => onSelect('/')} />}
      {crumbs.slice(0, -1).map((crumb, i) => {
        const crumbPath = `/${crumbs.slice(0, i + 1).join('/')}`;
        return (
          <Crumb
            key={crumbPath}
            name={crumb}
            onClick={() => onSelect(crumbPath)}
          />
        );
      })}
      <CopyableCrumb name={crumbs[crumbs.length - 1]} path={path} />
    </h1>
  );
}

export default Breadcrumbs;
