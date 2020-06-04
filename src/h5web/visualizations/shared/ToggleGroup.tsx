import React, { createContext, ReactNode, ReactElement } from 'react';
import type { IconType } from 'react-icons';
import styles from './ToggleGroup.module.css';

interface ToggleGroupProps {
  role: 'tablist' | 'radiogroup';
  value: string;
  onChange(val: string): void;
}

const ToggleGroupContext = createContext<ToggleGroupProps | undefined>(
  undefined
);

function useToggleGroupProps(): ToggleGroupProps {
  const context = React.useContext(ToggleGroupContext);

  if (!context) {
    throw new Error('Missing Toggle Group provider.');
  }

  return context;
}

interface BtnProps {
  label: string;
  value: string;
  icon?: IconType;
}

function Btn(props: BtnProps): ReactElement {
  const { label, value, icon: Icon } = props;
  const { role, value: selectedValue, onChange } = useToggleGroupProps();

  return (
    <button
      className={styles.btn}
      type="button"
      role={role === 'tablist' ? 'tab' : 'radio'}
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

type Props = ToggleGroupProps & {
  ariaLabel?: string;
  children: ReactNode;
};

function ToggleGroup(props: Props): JSX.Element {
  const { value, onChange, role, ariaLabel, children } = props;

  return (
    <ToggleGroupContext.Provider value={{ role, value, onChange }}>
      <div className={styles.toggleGroup} role={role} aria-label={ariaLabel}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

ToggleGroup.Btn = Btn;
export default ToggleGroup;
