import React from 'react';
import { FiCpu, FiGrid } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { Vis } from './models';
import styles from './VisSelector.module.css';

const VIS_ICONS: Record<Vis, IconType> = {
  [Vis.Raw]: FiCpu,
  [Vis.Matrix]: FiGrid,
};

interface Props {
  activeVis?: Vis;
  choices: Vis[];
  onChange: (vis: Vis) => void;
}

function VisSelector(props: Props): JSX.Element {
  const { activeVis, choices, onChange } = props;

  return (
    <div role="tablist" aria-label="Visualization">
      {choices.map(vis => {
        const Icon = VIS_ICONS[vis];
        return (
          <button
            key={vis}
            className={styles.btn}
            type="button"
            role="tab"
            aria-selected={vis === activeVis}
            onClick={() => {
              onChange(vis);
            }}
          >
            <Icon />
            {vis}
          </button>
        );
      })}
    </div>
  );
}

export default VisSelector;
