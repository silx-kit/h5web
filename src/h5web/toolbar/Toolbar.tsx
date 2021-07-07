import { ReactElement, Children } from 'react';
import { useMeasure } from '@react-hookz/web';
import { useList } from 'react-use';
import styles from './Toolbar.module.css';
import Separator from './Separator';
import OverflowMenu from './OverflowMenu';
import MeasuredControl from './MeasuredControl';

interface Props {
  children?: ReactElement | (ReactElement | undefined)[];
}

function Toolbar(props: Props) {
  const { children } = props;

  // Convert `children` to array, as it cannot be used directly (and remove `undefined` children)
  const allChildren = Children.toArray(children) as ReactElement[];

  const [containerSize, containerRef] = useMeasure<HTMLDivElement>();
  const availableWidth = containerSize ? containerSize.width : 0;

  const [childrenWidths, { updateAt: setChildWidth }] = useList<number>();

  // Group visible and hidden children based on their accumulated width
  const [visibleChildren, hiddenChildren, allMeasured] = allChildren.reduce<
    [ReactElement[], ReactElement[], boolean, number]
  >(
    ([accVisible, accHidden, accAllMeasured, accWidth], child, index) => {
      const width = childrenWidths[index] ?? 0;
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
                setChildWidth(allChildren.indexOf(child), width);
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
