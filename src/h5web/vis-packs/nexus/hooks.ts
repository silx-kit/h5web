import { isDefined } from '../../guards';
import type { AxisMapping, ScaleType } from '../core/models';
import { useDatasetValues } from '../core/hooks';
import type { AxisDatasetMapping } from './models';
import { getDatasetLabel } from './utils';

export function useAxisMapping(
  mapping: AxisDatasetMapping,
  axisScaleTypes: ScaleType[] | undefined
): AxisMapping {
  const axisValues = useDatasetValues(mapping.filter(isDefined));

  return mapping.map((dataset, i) => {
    return (
      dataset && {
        label: getDatasetLabel(dataset),
        value: axisValues[dataset.name],
        scaleType: axisScaleTypes && axisScaleTypes[i],
      }
    );
  });
}
