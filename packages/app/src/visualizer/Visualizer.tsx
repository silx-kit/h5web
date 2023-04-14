import { useDataContext } from '../providers/DataProvider';
import { resolvePath } from './utils';
import VisManager from './VisManager';
import styles from './Visualizer.module.css';

interface Props {
  path: string;
}

function Visualizer(props: Props) {
  const { path } = props;

  const { entitiesStore, attrValuesStore } = useDataContext();
  const resolution = resolvePath(path, entitiesStore, attrValuesStore);

  if (!resolution) {
    return (
      <p className={styles.fallback}>
        No visualization available for this entity.
      </p>
    );
  }

  const { entity, supportedVis } = resolution;
  return (
    <VisManager
      key={entity.path} // reset local states when changing entity (e.g. active vis)
      entity={entity}
      supportedVis={supportedVis}
    />
  );
}

export default Visualizer;
