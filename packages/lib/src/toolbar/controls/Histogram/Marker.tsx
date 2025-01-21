import { type UseDrag } from '@visx/drag/lib/useDrag';
import { type PointerEvent, useMemo } from 'react';

const ARROW_SIZE = 10;

interface Props {
  x: number;
  flipArrow?: boolean;
  dragState?: UseDrag;
}

function Marker(props: Props) {
  const { x, flipArrow, dragState } = props;

  const handlers = useMemo(
    () => ({
      onPointerMove: dragState?.dragMove,
      onPointerUp:
        dragState &&
        ((e: PointerEvent) => {
          if (e.target instanceof Element) {
            e.target.releasePointerCapture(e.pointerId);
          }
          dragState.dragEnd(e);
        }),
      onPointerDown:
        dragState &&
        ((e: PointerEvent) => {
          if (e.target instanceof Element) {
            e.target.setPointerCapture(e.pointerId);
          }
          dragState.dragStart(e);
        }),
    }),
    [dragState],
  );

  return (
    <g
      transform={`translate(${dragState?.dx || 0}, 0)`}
      style={{ cursor: dragState ? 'ew-resize' : undefined }}
      {...handlers}
    >
      <line x1={x} x2={x} y1={0} y2="100%" />
      <polygon
        x={x}
        y={0}
        points={`${x},0 ${x},${ARROW_SIZE} ${
          flipArrow ? x - ARROW_SIZE : x + ARROW_SIZE
        },${ARROW_SIZE / 2}`}
      />
      {/* Add an invisible rectangle to help selection */}
      {dragState && (
        <rect
          x={x - ARROW_SIZE}
          y={0}
          height="100%"
          width={2 * ARROW_SIZE}
          fill="transparent"
          fillOpacity={0}
          stroke="none"
        />
      )}
    </g>
  );
}

export default Marker;
