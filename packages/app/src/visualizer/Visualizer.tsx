import type { Entity } from '@h5web/shared';
import { assertDefined } from '@h5web/shared';

import Profiler from '../Profiler';
import { useActiveVis } from '../vis-packs/hooks';
import type { VisDef } from '../vis-packs/models';
import VisSelector from './VisSelector';
import styles from './Visualizer.module.css';

interface Props {
  entity: Entity;
  supportedVis: VisDef[];
}

function Visualizer(props: Props) {
  const { entity, supportedVis } = props;
  assertDefined(supportedVis[0], 'Expected supported visualization');

  const [activeVis, setActiveVis] = useActiveVis(supportedVis);
  const { Container, Toolbar } = activeVis;

  if (!('ResizeObserver' in window)) {
    throw new Error(
      "Your browser's version is not supported. Please upgrade to the latest version."
    );
  }

  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar}>
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={setActiveVis}
        />
        {Toolbar && <Toolbar />}
      </div>

      <div className={styles.displayArea}>
        <Profiler id={activeVis.name}>
          <Container key={entity.path} entity={entity} />
        </Profiler>
      </div>
    </div>
  );
}

export default Visualizer;
