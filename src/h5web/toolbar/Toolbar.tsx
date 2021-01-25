import { ReactElement, Children, cloneElement, Fragment } from 'react';
import Measure from 'react-measure';
import { useMeasure, useMap } from 'react-use';
import styles from './Toolbar.module.css';
import Separator from './Separator';
import OverflowMenu from './OverflowMenu';

// Controls must have a `disabled` prop to accessibly disable the interactive elements they contain
type ToolbarControl = ReactElement<{ disabled: boolean }>;

export interface ToolbarProps {
  // Toolbar controls must be direct children of `Toolbar` (no fragment)
  children?: (ToolbarControl | undefined)[] | ToolbarControl;
}

function Toolbar(props: ToolbarProps): ReactElement {
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

  const isSeparatorLast =
    visibleChildren[visibleChildren.length - 1]?.type === Separator;

  return (
    <div className={styles.toolbar}>
      <div
        ref={containerRef as (element: HTMLElement | null) => void} // https://github.com/streamich/react-use/issues/1264
        className={styles.controls}
      >
        {isSeparatorLast ? visibleChildren.slice(0, -1) : visibleChildren}
      </div>

      <OverflowMenu>
        {hiddenChildren.filter((child) => child.type !== Separator)}
      </OverflowMenu>

      {/* Render all children invisibly to measure them */}
      <div className={styles.measuringContainer} aria-hidden="true">
        {allChildren.map((child) => (
          <Measure
            key={`measure-${child.key || ''}`}
            onResize={({ entry }) => {
              if (entry) {
                setChildWidth(child.key as string, entry.width);
              }
            }}
          >
            {({ measureRef }) => (
              <div ref={measureRef} className={styles.measuredControl}>
                {/* Children should ensure they cannot receive focus when disabled */}
                {cloneElement(child, { disabled: true })}
              </div>
            )}
          </Measure>
        ))}
      </div>
    </div>
  );
}

export default Toolbar;
