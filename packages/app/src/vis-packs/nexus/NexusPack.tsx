import type { Entity } from '@h5web/shared';
import { useContext } from 'react';

import { ProviderContext } from '../../providers/context';
import Visualizer from '../../visualizer/Visualizer';
import { useActiveVis } from '../hooks';
import { getDefaultEntity, getSupportedVis } from './pack-utils';

interface Props {
  entity: Entity;
}

function NexusPack(props: Props) {
  const { entity } = props;
  const { entitiesStore } = useContext(ProviderContext);

  // Resolve any `default` attribute(s) to find entity to visualize
  const defaultEntity = getDefaultEntity(entity, entitiesStore);

  const supportedVis = getSupportedVis(defaultEntity);
  const supportVisArr = supportedVis ? [supportedVis] : [];

  const [activeVis, setActiveVis] = useActiveVis(supportVisArr);

  return (
    <Visualizer
      entity={defaultEntity}
      activeVis={activeVis}
      supportedVis={supportVisArr}
      onActiveVisChange={setActiveVis}
    />
  );
}

export default NexusPack;
