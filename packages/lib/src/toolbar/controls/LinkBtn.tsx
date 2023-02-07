import type { AnchorHTMLAttributes, ComponentType, SVGAttributes } from 'react';

import styles from '../Toolbar.module.css';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  iconOnly?: boolean;
  small?: boolean;
  raised?: boolean;
}

function LinkBtn(props: Props) {
  const { label, icon: Icon, iconOnly, small, raised, ...attrs } = props;

  return (
    <a
      className={styles.btn}
      title={iconOnly ? label : undefined}
      data-small={small || undefined}
      data-raised={raised || undefined}
      aria-label={iconOnly ? label : undefined}
      {...attrs}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!iconOnly && <span className={styles.label}>{label}</span>}
      </span>
    </a>
  );
}

export default LinkBtn;
