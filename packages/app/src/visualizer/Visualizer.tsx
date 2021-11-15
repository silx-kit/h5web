import type { Entity } from '@h5web/shared';
import { handleError } from '@h5web/shared';
import { useContext } from 'react';

import { ProviderContext } from '../providers/context';
import { ProviderError } from '../providers/models';
import VisManager from './VisManager';
import styles from './Visualizer.module.css';
import { resolvePath } from './utils';

interface Props {
  path: string;
}

function Visualizer(props: Props) {
  const { path } = props;

  const { entitiesStore } = useContext(ProviderContext);

  function getEntity(entityPath: string): Entity {
    return handleError(
      () => entitiesStore.get(entityPath),
      ProviderError.EntityNotFound,
      `No entity found at ${entityPath}`
    );
  }

  const resolution = resolvePath(path, getEntity);

  if (!resolution) {
    return (
      <p className={styles.fallback}>
        No visualization available for this entity.
      </p>
    );
  }

  const { entity, supportedVis } = resolution;
  return <VisManager entity={entity} supportedVis={supportedVis} />;
}

export default Visualizer;
