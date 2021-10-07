import type { TickRendererProps } from '@visx/axis';

function Tick(props: TickRendererProps) {
  const { formattedValue, ...tickProps } = props;

  return (
    /* Increase `dy` slightly to fix alignment and spacing with tick lines */
    <text {...tickProps} dy="0.3125em">
      {formattedValue}
    </text>
  );
}

export default Tick;
