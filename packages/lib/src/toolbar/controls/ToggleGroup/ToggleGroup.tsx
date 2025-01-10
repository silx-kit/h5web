import type { ReactElement } from 'react';

import type { ToggleGroupContextValue } from './context';
import { ToggleGroupContext } from './context';
import styles from './ToggleGroup.module.css';
import type { ToggleGroupBtnProps } from './ToggleGroupBtn';
import ToggleGroupBtn from './ToggleGroupBtn';

interface Props extends ToggleGroupContextValue {
  ariaLabel?: string;
  children: ReactElement<ToggleGroupBtnProps>[];
  id?: string;
}

function ToggleGroup(props: Props) {
  const { role, ariaLabel, value, disabled, onChange, children, id } = props;

  return (
    <ToggleGroupContext.Provider value={{ role, value, disabled, onChange }}>
      <div className={styles.group} role={role} aria-label={ariaLabel} id={id}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

ToggleGroup.Btn = ToggleGroupBtn;
export default ToggleGroup;
