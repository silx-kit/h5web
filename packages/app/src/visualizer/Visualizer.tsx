import { useSuspenseQuery } from '@tanstack/react-query';

import { useDataContext } from '../providers/DataProvider';
import { resolvePathQuery } from './queries';
import VisManager from './VisManager';
import styles from './Visualizer.module.css';

interface Props {
  path: string;
}

function Visualizer(props: Props) {
  const { path } = props;

  const dataContext = useDataContext();
  const { data: resolution } = useSuspenseQuery(
    resolvePathQuery(path, dataContext),
  );

  if (!resolution) {
    return (
      <div className={styles.fallback}>
        <p>Nothing to display</p>
        <p className={styles.fallbackHint}>
          Please select another entity in the sidebar.
        </p>
      </div>
    );
  }

  const { entity, supportedVis, primaryVis } = resolution;
  return (
    <VisManager
      key={entity.path} // reset local states when changing entity (e.g. active vis)
      entity={entity}
      supportedVis={supportedVis}
      primaryVis={primaryVis}
    />
  );
}

export default Visualizer;
