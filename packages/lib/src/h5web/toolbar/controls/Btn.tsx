import type { AriaAttributes } from 'react';
import type { IconType } from 'react-icons';
import styles from '../Toolbar.module.css';

interface Props extends AriaAttributes {
  label: string;
  icon?: IconType;
  iconOnly?: boolean;
  small?: boolean;
  raised?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function Btn(props: Props) {
  const {
    label,
    icon: Icon,
    iconOnly,
    small,
    raised,
    disabled,
    onClick,
    ...ariaAttrs
  } = props;

  return (
    <button
      className={styles.btn}
      type="button"
      onClick={() => onClick()}
      disabled={disabled}
      data-small={small || undefined}
      data-raised={raised || undefined}
      aria-label={iconOnly ? label : undefined}
      {...ariaAttrs}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!iconOnly && <span className={styles.label}>{label}</span>}
      </span>
    </button>
  );
}

export type { Props as BtnProps };
export default Btn;
