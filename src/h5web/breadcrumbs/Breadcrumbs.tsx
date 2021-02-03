import { ReactElement, useContext } from 'react';
import styles from './BreadcrumbsBar.module.css';
import { assertAbsolutePath } from '../guards';
import { ProviderContext } from '../providers/context';
import Crumb from './Crumb';

interface Props {
  path: string;
  onSelect: (path: string) => void;
  showDomain: boolean;
}

function Breadcrumbs(props: Props): ReactElement {
  const { path, onSelect, showDomain } = props;

  assertAbsolutePath(path);
  const { domain } = useContext(ProviderContext);

  if (path === '/') {
    return (
      <h1 className={styles.breadCrumbs}>
        <span className={styles.crumb} data-current>
          {domain}
        </span>
      </h1>
    );
  }

  // Remove leading /
  const crumbs = path.slice(1).split('/');

  return (
    <h1 className={styles.breadCrumbs}>
      {showDomain && <Crumb name={domain} onClick={() => onSelect('/')} />}
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
      <span className={styles.crumb} data-current>
        {crumbs[crumbs.length - 1]}
      </span>
    </h1>
  );
}

export default Breadcrumbs;
