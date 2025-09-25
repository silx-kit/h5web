import { assertDefined } from '@h5web/shared/guards';
import { type ProvidedEntity } from '@h5web/shared/hdf5-models';
import { useState } from 'react';

import { useDataContext } from '../providers/DataProvider';
import { type VisDef } from '../vis-packs/models';
import { useActiveVis } from './hooks';
import VisSelector from './VisSelector';
import styles from './Visualizer.module.css';

interface Props {
  entity: ProvidedEntity;
  supportedVis: VisDef[];
  primaryVis: VisDef | undefined;
}

function VisManager(props: Props) {
  const { entity, supportedVis, primaryVis } = props;
  assertDefined(supportedVis[0], 'Expected supported visualization');

  if (!('ResizeObserver' in globalThis)) {
    throw new Error(
      "Your browser's version is not supported. Please upgrade to the latest version.",
    );
  }

  const [activeVis, setActiveVis] = useActiveVis(supportedVis, primaryVis);
  const { Container } = activeVis;

  const [visBarElem, setVisBarElem] = useState<HTMLDivElement>();

  const { valuesStore } = useDataContext();
  function onVisChange(index: number) {
    setActiveVis(index);
    valuesStore.abortAll('visualization changed', true);
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
