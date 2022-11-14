import {
  buildEntityPath,
  EntityKind,
  isAbsolutePath,
  isDataset,
} from '@h5web/shared';
import { capitalize } from 'lodash';
import { Suspense, memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useDataContext } from '../providers/DataProvider';
import AttrErrorFallback from './AttrErrorFallback';
import AttrValueLoader from './AttrValueLoader';
import AttributesInfo from './AttributesInfo';
import EntityInfo from './EntityInfo';
import FiltersInfo from './FiltersInfo';
import MetadataTable from './MetadataTable';
import styles from './MetadataViewer.module.css';

interface Props {
  path: string;
  onSelectPath: (path: string) => void;
}

function MetadataViewer(props: Props) {
  const { path, onSelectPath } = props;

  const { entitiesStore } = useDataContext();
  const entity = entitiesStore.get(path);

  const { kind, attributes } = entity;
  const title = kind === EntityKind.Unresolved ? 'Entity' : capitalize(kind);

  return (
    <div className={styles.metadataViewer}>
      <MetadataTable title={title}>
        <EntityInfo entity={entity} />
      </MetadataTable>

      {attributes.length > 0 && (
        <MetadataTable title="Attributes">
          <ErrorBoundary
            resetKeys={[path]}
            FallbackComponent={AttrErrorFallback}
          >
            <Suspense fallback={<AttrValueLoader />}>
              <AttributesInfo
                entity={entity}
                onFollowPath={(pathToFollow) => {
                  const absolutePath = isAbsolutePath(pathToFollow)
                    ? pathToFollow
                    : buildEntityPath(path, pathToFollow);

                  onSelectPath(absolutePath);
                }}
              />
            </Suspense>
          </ErrorBoundary>
        </MetadataTable>
      )}

      {isDataset(entity) && entity.filters && entity.filters.length > 0 && (
        <MetadataTable title="Compression filters">
          <FiltersInfo filters={entity.filters} />
        </MetadataTable>
      )}
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default memo(MetadataViewer);
