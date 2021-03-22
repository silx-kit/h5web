import type { AriaAttributes } from 'react';
import type { IconType } from 'react-icons';
import styles from '../Toolbar.module.css';

type Props = AriaAttributes & {
  label: string;
  icon?: IconType;
  iconOnly?: boolean;
  small?: boolean;
  raised?: boolean;
  value: boolean;
  onChange: () => void;
  disabled?: boolean;
};

function ToggleBtn(props: Props) {
  const {
    label,
    icon: Icon,
    iconOnly,
    small,
    raised,
    value,
    onChange,
    disabled,
    ...ariaAttrs
  } = props;

  return (
    <button
      className={styles.btn}
      type="button"
      onClick={onChange}
      disabled={disabled}
      data-small={small || undefined}
      data-raised={raised || undefined}
      aria-label={iconOnly ? label : undefined}
      aria-pressed={value}
      {...ariaAttrs}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!iconOnly && <span className={styles.label}>{label}</span>}
      </span>
    </button>
  );
}

export default ToggleBtn;
