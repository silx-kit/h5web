import { Line } from '@visx/shape';
import { TooltipWithBounds } from '@visx/tooltip';
import type { ReactNode } from 'react';

import Overlay from './Overlay';
import styles from './TooltipMesh.module.css';
import { useVisCanvasContext } from './VisCanvasProvider';

interface Props {
  tooltipOpen: boolean;
  tooltipLeft: number | undefined;
  tooltipTop: number | undefined;
  guides?: 'horizontal' | 'vertical' | 'both';
  children?: ReactNode;
}

function TooltipOverlay(props: Props) {
  const { tooltipOpen, tooltipLeft, tooltipTop, guides, children } = props;

  const { canvasSize } = useVisCanvasContext();
  const { width, height } = canvasSize;

  return (
    <Overlay className={styles.overlay}>
      {tooltipOpen && children && (
        <>
          <TooltipWithBounds
            key={Math.random()}
            className={styles.tooltip}
            top={tooltipTop}
            left={tooltipLeft}
            unstyled
            applyPositionStyle
          >
            {children}
          </TooltipWithBounds>
          {guides && (
            <svg className={styles.guides}>
              {guides !== 'horizontal' && (
                <Line
                  from={{ x: tooltipLeft, y: 0 }}
                  to={{ x: tooltipLeft, y: height }}
                />
              )}
              {guides !== 'vertical' && (
                <Line
                  from={{ x: 0, y: tooltipTop }}
                  to={{ x: width, y: tooltipTop }}
                />
              )}
            </svg>
          )}
        </>
      )}
    </Overlay>
  );
}

export default TooltipOverlay;
