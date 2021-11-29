import type { Entity } from '@h5web/shared';
import { assertDefined } from '@h5web/shared';
import { useState } from 'react';

import Profiler from '../Profiler';
import type { VisDef } from '../vis-packs/models';
import VisSelector from './VisSelector';
import styles from './Visualizer.module.css';
import { useActiveVis } from './hooks';

interface Props {
  entity: Entity;
  supportedVis: VisDef[];
}

function VisManager(props: Props) {
  const { entity, supportedVis } = props;
  assertDefined(supportedVis[0], 'Expected supported visualization');

  if (!('ResizeObserver' in window)) {
    throw new Error(
      "Your browser's version is not supported. Please upgrade to the latest version."
    );
  }

  const [activeVis, setActiveVis] = useActiveVis(supportedVis);
  const { Container } = activeVis;

  const [visBarElem, setVisBarElem] = useState<HTMLDivElement>();

  return (
    <div className={styles.visManager}>
      <div
        ref={(elem) => setVisBarElem(elem ?? undefined)}
        className={styles.visBar}
      >
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={setActiveVis}
        />
      </div>

      <div className={styles.displayArea}>
        <Profiler id={activeVis.name}>
          <Container
            key={entity.path}
            entity={entity}
            toolbarContainer={visBarElem}
          />
        </Profiler>
      </div>
    </div>
  );
}

export default VisManager;
