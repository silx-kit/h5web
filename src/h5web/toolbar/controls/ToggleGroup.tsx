import { useContext, createContext, ReactElement } from 'react';
import type { IconType } from 'react-icons';
import styles from './ToggleGroup.module.css';

interface ToggleGroupProps {
  role: 'tablist' | 'radiogroup';
  value: string;
  disabled?: boolean;
  onChange: (val: string) => void;
}

const ToggleGroupContext = createContext<ToggleGroupProps | undefined>(
  undefined
);

function useToggleGroupProps(): ToggleGroupProps {
  const context = useContext(ToggleGroupContext);

  if (!context) {
    throw new Error('Missing Toggle Group provider.');
  }

  return context;
}

interface BtnProps {
  label: string;
  value: string;
  icon?: IconType;
  disabled?: boolean;
}

function Btn(props: BtnProps) {
  const { label, value, icon: Icon, disabled = false } = props;
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
      role={role === 'tablist' ? 'tab' : 'radio'}
      data-raised
      aria-checked={value === selectedValue}
      onClick={() => {
        onChange(value);
      }}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        <span className={styles.label}>{label}</span>
      </span>
    </button>
  );
}

interface Props extends ToggleGroupProps {
  ariaLabel?: string;
  children: ReactElement<BtnProps>[];
}

function ToggleGroup(props: Props) {
  const { role, ariaLabel, value, disabled, onChange, children } = props;

  return (
    <ToggleGroupContext.Provider value={{ role, value, disabled, onChange }}>
      <div className={styles.group} role={role} aria-label={ariaLabel}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

ToggleGroup.Btn = Btn;
export default ToggleGroup;
