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
