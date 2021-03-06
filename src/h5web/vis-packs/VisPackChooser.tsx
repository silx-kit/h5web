import { useContext } from 'react';
import { ProviderContext } from '../providers/context';
import { ProviderError } from '../providers/models';
import { handleError } from '../utils';
import CorePack from './core/CorePack';
import NexusPack from './nexus/NexusPack';
import { isNxGroup } from './nexus/utils';

interface Props {
  path: string;
}

function VisPackChooser(props: Props) {
  const { path } = props;

  if (!('ResizeObserver' in window)) {
    throw new Error(
      "Your browser's version is not supported. Please upgrade to the latest version."
    );
  }

  const { entitiesStore } = useContext(ProviderContext);

  const entity = handleError(
    () => entitiesStore.get(path),
    ProviderError.NotFound,
    `No entity found at ${path}`
  );

  if (isNxGroup(entity)) {
    return <NexusPack entity={entity} />;
  }

  return <CorePack entity={entity} />;
}

export default VisPackChooser;
