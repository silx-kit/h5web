import { type ComponentType, type HTMLAttributes, type Ref } from 'react';
import { MdArrowDropDown } from 'react-icons/md';

import styles from '../Toolbar.module.css';

interface Props extends HTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement | null>;
  label: string;
  Icon?: ComponentType<{ className: string }>;
  iconOnly?: boolean;
  small?: boolean;
  raised?: boolean;
  withArrow?: boolean;
  disabled?: boolean;
}

function Btn(props: Props) {
  const {
    ref,
    label,
    Icon,
    iconOnly,
    small,
    raised,
    withArrow,
    disabled,
    ...btnProps
  } = props;

  return (
    <button
      ref={ref}
      className={styles.btn}
      type="button"
      title={iconOnly ? label : undefined}
      aria-label={iconOnly ? label : undefined}
      disabled={disabled}
      data-small={small || undefined}
      data-raised={raised || undefined}
      {...btnProps}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!iconOnly && <span className={styles.label}>{label}</span>}
        {withArrow && <MdArrowDropDown className={styles.arrowIcon} />}
      </span>
    </button>
  );
}

export type { Props as BtnProps };
export default Btn;
