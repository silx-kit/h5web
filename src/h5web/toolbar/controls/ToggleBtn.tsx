import type { ReactElement } from 'react';
import type { IconType } from 'react-icons';
import styles from '../Toolbar.module.css';

interface Props {
  label: string;
  icon?: IconType;
  iconOnly?: boolean;
  value: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function ToggleBtn(props: Props): ReactElement {
  const { label, icon: Icon, iconOnly, value, onChange, disabled } = props;

  return (
    <button
      className={styles.btn}
      type="button"
      aria-label={iconOnly ? label : undefined}
      aria-pressed={value}
      onClick={onChange}
      disabled={disabled}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!iconOnly && <span className={styles.label}>{label}</span>}
      </span>
    </button>
  );
}

export default ToggleBtn;
