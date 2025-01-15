import { type ComponentType, type SVGAttributes } from 'react';

import { useToggleGroupProps } from './context';
import styles from './ToggleGroup.module.css';

interface Props {
  label: string;
  value: string;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  iconOnly?: boolean;
  hint?: string;
  disabled?: boolean;
}

function ToggleGroupBtn(props: Props) {
  const { label, value, icon: Icon, hint, iconOnly, disabled = false } = props;
  const {
    role,
    value: selectedValue,
    disabled: isGroupDisabled,
    onChange,
  } = useToggleGroupProps();

  return (
    <button
      disabled={disabled || isGroupDisabled}
      className={styles.btn}
      type="button"
      title={hint || (iconOnly ? label : undefined)}
      role={role === 'tablist' ? 'tab' : 'radio'}
      data-raised
      data-hint={hint || undefined}
      aria-label={iconOnly ? label : undefined}
      aria-checked={value === selectedValue}
      onClick={() => {
        onChange(value);
      }}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!iconOnly && <span className={styles.label}>{label}</span>}
      </span>
    </button>
  );
}

export { type Props as ToggleGroupBtnProps };
export default ToggleGroupBtn;
