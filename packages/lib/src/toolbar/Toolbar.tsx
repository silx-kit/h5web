import { useMap, useMeasure } from '@react-hookz/web';
import type { PropsWithChildren, ReactNode } from 'react';
import flattenChildren from 'react-keyed-flatten-children';

import type { InteractionInfo } from '../interactions/models';
import InteractionHelp from './controls/InteractionHelp';
import MeasuredControl from './MeasuredControl';
import type { ReactElementWithKey } from './models';
import OverflowMenu from './OverflowMenu';
import Separator from './Separator';
import styles from './Toolbar.module.css';
import { isValidElementWithKey } from './utils';

interface Props {
  interactions?: InteractionInfo[];
  overflowChildren?: ReactNode;
}

function Toolbar(props: PropsWithChildren<Props>) {
  const { children, interactions, overflowChildren = [] } = props;

  /* Convert `children` to flat array by traversing nested arrays and fragments.
   * (Note that `flattenChildren` guarantees stable string keys regardless of JSX logic.) */
  const allChildren = flattenChildren(children).filter(isValidElementWithKey);

  const [containerSize, containerRef] = useMeasure<HTMLDivElement>();
  const availableWidth = containerSize ? containerSize.width : 0;

  const childrenWidths = useMap<string, number>();

  // Group children based on their accumulated width
  const [inView, outOfView] = allChildren.reduce<
    [ReactElementWithKey[], ReactElementWithKey[], number]
  >(
    ([accVisible, accHidden, accWidth], child) => {
      const width = childrenWidths.get(child.key) ?? 0;
      const isOverflowing = accWidth + width > availableWidth;

      return [
        !isOverflowing ? [...accVisible, child] : accVisible,
        isOverflowing ? [...accHidden, child] : accHidden,
        accWidth + width,
      ];
    },
    [[], [], 0],
  );

  const isSeparatorLast = inView[inView.length - 1]?.type === Separator;

  return (
    <div className={styles.toolbar}>
      <div ref={containerRef} className={styles.controls}>
        {(isSeparatorLast ? inView.slice(0, -1) : inView).map((child) => (
          <MeasuredControl
            key={child.key}
            knownWidth={childrenWidths.get(child.key)}
            onMeasure={(width) => {
              childrenWidths.set(child.key, width);
            }}
          >
            {child}
          </MeasuredControl>
        ))}
      </div>

      <OverflowMenu>
        {overflowChildren}
        {outOfView.filter((child) => child.type !== Separator)}
      </OverflowMenu>

      {interactions && <Separator />}
      {interactions && <InteractionHelp interactions={interactions} />}
    </div>
  );
}

export type { Props as ToolbarProps };
export default Toolbar;
