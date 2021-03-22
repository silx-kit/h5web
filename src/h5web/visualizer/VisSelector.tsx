import styles from './VisSelector.module.css';
import type { VisDef } from '../vis-packs/models';

interface Props<T extends VisDef> {
  activeVis: T;
  choices: T[];
  onChange: (vis: T) => void;
}

function VisSelector<T extends VisDef>(props: Props<T>) {
  const { activeVis, choices, onChange } = props;

  return (
    <div className={styles.selector} role="tablist" aria-label="Visualization">
      {choices.map((vis) => {
        const { name, Icon } = vis;

        return (
          <button
            key={name}
            className={styles.btn}
            type="button"
            role="tab"
            aria-selected={vis === activeVis}
            onClick={() => onChange(vis)}
          >
            <Icon className={styles.icon} />
            {name}
          </button>
        );
      })}
    </div>
  );
}

export default VisSelector;
