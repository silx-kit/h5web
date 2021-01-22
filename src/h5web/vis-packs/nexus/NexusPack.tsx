import { ReactElement, useContext } from 'react';
import { ProviderContext } from '../../providers/context';
import type { Entity } from '../../providers/models';
import { getDefaultEntity, getSupportedVis } from './pack-utils';
import { useActiveVis } from '../hooks';
import Visualizer from '../../visualizer/Visualizer';

interface Props {
  entity: Entity;
}

function NexusPack(props: Props): ReactElement {
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
