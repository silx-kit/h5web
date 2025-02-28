import { isAbsolutePath, isDataset } from '@h5web/shared/guards';
import { EntityKind } from '@h5web/shared/hdf5-models';
import { buildEntityPath } from '@h5web/shared/hdf5-utils';
import { memo, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useEntity } from '../hooks';
import AttrErrorFallback from './AttrErrorFallback';
import AttributesInfo from './AttributesInfo';
import AttrValueLoader from './AttrValueLoader';
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

  const entity = useEntity(path);
  const { kind, attributes } = entity;
  const title = kind === EntityKind.Unresolved ? 'Entity' : kind;

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
