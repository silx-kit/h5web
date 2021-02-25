import type { ReactElement } from 'react';
import type { IconType } from 'react-icons';
import styles from '../Toolbar.module.css';

interface Props {
  label: string;
  icon?: IconType;
  iconOnly?: boolean;
  small?: boolean;
  raised?: boolean;
  value: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function ToggleBtn(props: Props): ReactElement {
  const { label, small, raised, value, onChange, disabled } = props;
  const { icon: Icon, iconOnly } = props;

  return (
    <button
      className={styles.btn}
      type="button"
      aria-label={iconOnly ? label : undefined}
      aria-pressed={value}
      onClick={onChange}
      disabled={disabled}
      data-small={small || undefined}
      data-raised={raised || undefined}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!iconOnly && <span className={styles.label}>{label}</span>}
      </span>
    </button>
  );
}

export default ToggleBtn;
