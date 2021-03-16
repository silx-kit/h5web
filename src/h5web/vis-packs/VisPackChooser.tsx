import { ReactElement, useContext } from 'react';
import { ProviderContext } from '../providers/context';
import CorePack from './core/CorePack';
import NexusPack from './nexus/NexusPack';
import { getAttributeValue } from './nexus/utils';

interface Props {
  path: string;
}

function VisPackChooser(props: Props): ReactElement {
  const { path } = props;

  if (!('ResizeObserver' in window)) {
    throw new Error(
      "Your browser's version is not supported. Please upgrade to the latest version."
    );
  }

  const { entitiesStore } = useContext(ProviderContext);
  const entity = entitiesStore.get(path);

  if (
    getAttributeValue(entity, 'default') ||
    getAttributeValue(entity, 'NX_class') === 'NXdata'
  ) {
    return <NexusPack entity={entity} />;
  }

  return <CorePack entity={entity} />;
}

export default VisPackChooser;
