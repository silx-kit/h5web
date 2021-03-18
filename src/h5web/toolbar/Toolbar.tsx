import { ReactElement, Children, Fragment } from 'react';
import { useMeasure, useMap } from 'react-use';
import styles from './Toolbar.module.css';
import Separator from './Separator';
import OverflowMenu from './OverflowMenu';
import MeasuredControl from './MeasuredControl';

interface Props {
  // Toolbar controls must be direct children of `Toolbar` (no fragment)
  children?: (ReactElement | undefined)[] | ReactElement;
}

function Toolbar(props: Props): ReactElement {
  const { children } = props;
  const allChildren = Children.toArray(children) as ReactElement[];

  if (allChildren.filter((child) => child.type === Fragment).length > 0) {
    throw new Error('Fragment not allowed as child of Toolbar');
  }

  const [containerRef, { width: availableWidth }] = useMeasure();
  const [childrenWidths, { set: setChildWidth }] = useMap<
    Record<string, number>
  >();

  // Filter out children that haven't been measured or with width of `0`
  const measuredChildren = allChildren.filter(
    (child) => !!childrenWidths[child.key as string]
  );

  // Measure cumulative widths to find index of first overflowing child
  const cumulativeWidths = measuredChildren.reduce<number[]>((acc, child) => {
    const width = childrenWidths[child.key as string];
    return [...acc, (acc[acc.length - 1] ?? 0) + width];
  }, []);

  const firstOverflowIndex = [...cumulativeWidths, Infinity].findIndex(
    (width) => width > availableWidth
  );

  // Group visible and hidden children
  const visibleChildren = measuredChildren.slice(0, firstOverflowIndex);
  const hiddenChildren = measuredChildren.slice(firstOverflowIndex);

  const allMeasured = measuredChildren.length === allChildren.length;
  const isSeparatorLast =
    visibleChildren[visibleChildren.length - 1]?.type === Separator;

  const allOrVisibleChildren = allMeasured
    ? isSeparatorLast
      ? visibleChildren.slice(0, -1)
      : visibleChildren
    : allChildren;

  return (
    <div className={styles.toolbar}>
      <div
        ref={containerRef as (element: HTMLElement | null) => void} // https://github.com/streamich/react-use/issues/1264
        className={styles.controls}
      >
        <div className={styles.controlsInner} data-all-measured={allMeasured}>
          {allOrVisibleChildren.map((child) => (
            <MeasuredControl
              key={`measure-${child.key || ''}`}
              onMeasure={(width) => setChildWidth(child.key as string, width)}
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
