import { assertDefined, type ProvidedEntity } from '@h5web/shared';
import { useState } from 'react';

import { useDataContext } from '../providers/DataProvider';
import { type VisDef } from '../vis-packs/models';
import { useActiveVis } from './hooks';
import VisSelector from './VisSelector';
import styles from './Visualizer.module.css';

interface Props {
  entity: ProvidedEntity;
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

  const { valuesStore } = useDataContext();
  function onVisChange(index: number) {
    setActiveVis(index);
    valuesStore.cancelOngoing();
    valuesStore.evictCancelled();
  }

  return (
    <div className={styles.visManager}>
      <div
        ref={(elem) => setVisBarElem(elem ?? undefined)}
        className={styles.visBar}
      >
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={onVisChange}
        />
      </div>

      <div className={styles.visArea}>
        <Container entity={entity} toolbarContainer={visBarElem} />
      </div>
    </div>
  );
}

export default VisManager;
