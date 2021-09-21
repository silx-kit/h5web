import { useContext } from 'react';
import type { Entity } from '@h5web/shared';
import { getDefaultEntity, getSupportedVis } from './pack-utils';
import { useActiveVis } from '../hooks';
import Visualizer from '../../visualizer/Visualizer';
import { ProviderContext } from '../../providers/context';

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
