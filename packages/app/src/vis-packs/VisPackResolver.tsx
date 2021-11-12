import type { Entity } from '@h5web/shared';
import { handleError } from '@h5web/shared';
import { useContext } from 'react';

import { ProviderContext } from '../providers/context';
import { ProviderError } from '../providers/models';
import Visualizer from '../visualizer/Visualizer';
import styles from '../visualizer/Visualizer.module.css';
import { getNxDefaultPath } from './nexus/pack-utils';
import { findSupportedVis } from './utils';

interface Props {
  path: string;
}

function VisPackResolver(props: Props) {
  const { path } = props;

  const { entitiesStore } = useContext(ProviderContext);

  function getEntity(entityPath: string): Entity {
    return handleError(
      () => entitiesStore.get(entityPath),
      ProviderError.EntityNotFound,
      `No entity found at ${entityPath}`
    );
  }

  const entity = getEntity(path);

  const supportedVis = findSupportedVis(entity);
  if (supportedVis.length > 0) {
    return <Visualizer entity={entity} supportedVis={supportedVis} />;
  }

  const nxDefaultPath = getNxDefaultPath(entity);
  if (nxDefaultPath) {
    return <VisPackResolver path={nxDefaultPath} />;
  }

  return (
    <p className={styles.fallback}>
      No visualization available for this entity.
    </p>
  );
}

export default VisPackResolver;
