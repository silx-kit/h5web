import { TooltipWithBounds } from '@visx/tooltip';
import { type PropsWithChildren } from 'react';

import { type ClassStyleAttrs } from '../models';
import Overlay from './Overlay';
import styles from './Tooltip.module.css';

interface Props extends ClassStyleAttrs {
  show?: boolean;
  left: number | undefined;
  top: number | undefined;
}

function Tooltip(props: PropsWithChildren<Props>) {
  const { className = '', style, show = true, left, top, children } = props;

  return (
    <Overlay className={styles.overlay}>
      {show && children !== undefined && children !== false && (
        <TooltipWithBounds
          key={Math.random()}
          className={`${styles.tooltip} ${className}`}
          style={style}
          unstyled={style === undefined}
          top={top}
          left={left}
          applyPositionStyle
        >
          {children}
        </TooltipWithBounds>
      )}
    </Overlay>
  );
}

export { type Props as TooltipProps };
export default Tooltip;
