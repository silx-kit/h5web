import type { ReactElement, ReactNode } from 'react';
import { useMap, useMeasure } from '@react-hookz/web';
import styles from './Toolbar.module.css';
import Separator from './Separator';
import OverflowMenu from './OverflowMenu';
import MeasuredControl from './MeasuredControl';
import flattenChildren from 'react-keyed-flatten-children';
import { isReactElement } from '../guards';

interface Props {
  children: ReactNode;
}

function Toolbar(props: Props) {
  const { children } = props;

  /* Convert `children` to flat array by traversing nested arrays and fragments.
   * (Note that `flattenChildren` guarantees stable string keys regardless of JSX logic.) */
  const allChildren = flattenChildren(children).filter(isReactElement);

  const [containerSize, containerRef] = useMeasure<HTMLDivElement>();
  const availableWidth = containerSize ? containerSize.width : 0;

  const childrenWidths = useMap<string, number>();

  // Group visible and hidden children based on their accumulated width
  const [visibleChildren, hiddenChildren, allMeasured] = allChildren.reduce<
    [ReactElement[], ReactElement[], boolean, number]
  >(
    ([accVisible, accHidden, accAllMeasured, accWidth], child) => {
      const width = childrenWidths.get(child.key as string) ?? 0;
      const isMeasured = width > 0;
      const isOverflowing = accWidth + width > availableWidth;

      return [
        isMeasured && !isOverflowing ? [...accVisible, child] : accVisible,
        isMeasured && isOverflowing ? [...accHidden, child] : accHidden,
        accAllMeasured && isMeasured,
        accWidth + width,
      ];
    },
    [[], [], true, 0]
  );

  const isSeparatorLast =
    visibleChildren[visibleChildren.length - 1]?.type === Separator;

  const allOrVisibleChildren = allMeasured
    ? isSeparatorLast
      ? visibleChildren.slice(0, -1)
      : visibleChildren
    : allChildren;

  return (
    <div className={styles.toolbar}>
      <div ref={containerRef} className={styles.controls}>
        <div className={styles.controlsInner} data-all-measured={allMeasured}>
          {allOrVisibleChildren.map((child) => (
            <MeasuredControl
              key={`measure-${child.key || ''}`}
              onMeasure={(width) => {
                childrenWidths.set(child.key as string, width);
              }}
            >
              {child}
            </MeasuredControl>
          ))}
        </div>
      </div>

      <OverflowMenu>
        {hiddenChildren.filter((child) => child.type !== Separator)}
      </OverflowMenu>
    </div>
  );
}

export default Toolbar;
