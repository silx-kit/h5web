import type { Entity } from '../../providers/models';
import { useActiveVis } from '../hooks';
import { getSupportedVis } from './pack-utils';
import Visualizer from '../../visualizer/Visualizer';

interface Props {
  entity: Entity;
}

function CorePack(props: Props) {
  const { entity } = props;

  const supportedVis = getSupportedVis(entity);
  const [activeVis, setActiveVis] = useActiveVis(supportedVis);

  return (
    <Visualizer
      entity={entity}
      activeVis={activeVis}
      supportedVis={supportedVis}
      onActiveVisChange={setActiveVis}
    />
  );
}

export default CorePack;
