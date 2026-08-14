import { type ArrayValue, type NumericType } from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { type ReactNode } from 'react';

import { useDimScaleValues } from './hooks';
import { type DimScaleDef } from './models';

interface Props {
  defs: AxisMapping<DimScaleDef>;
  render: (axisValues: AxisMapping<ArrayValue<NumericType>>) => ReactNode;
}

/* Fetches the values of the scales resolved by `useDimScaleDefs`. Suspends, so
 * this must be rendered inside a `VisBoundary`. */
function DimScaleFetcher(props: Props) {
  const { defs, render } = props;

  const axisValues = useDimScaleValues(defs);

  return render(axisValues);
}

export default DimScaleFetcher;
