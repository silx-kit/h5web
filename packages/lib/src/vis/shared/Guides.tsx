import { type SVGAttributes } from 'react';

import styles from './Guides.module.css';
import Overlay from './Overlay';

interface Props extends SVGAttributes<SVGSVGElement> {
  show?: boolean;
  top?: number | false;
  left?: number | false;
}

function Guides(props: Props) {
  const { show = true, top, left, ...svgProps } = props;

  return (
    <Overlay className={styles.overlay}>
      {show && (
        <svg className={styles.guides} width="100%" height="100%" {...svgProps}>
          {left !== undefined && left !== false && (
            <line x1={left} y1={0} x2={left} y2="100%" />
          )}
          {top !== undefined && top !== false && (
            <line x1={0} y1={top} x2="100%" y2={top} />
          )}
        </svg>
      )}
    </Overlay>
  );
}

export { type Props as GuidesProps };
export default Guides;
