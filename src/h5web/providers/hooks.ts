import {
  HDF5Link,
  HDF5Values,
  HDF5Metadata,
  HDF5Dataset,
  HDF5Datatype,
  HDF5Group,
} from './models';
import mockMetadata from '../../demo-app/mock-data/metadata.json';
import mockValues from '../../demo-app/mock-data/values.json';

export function useMetadata(
  link: HDF5Link
): HDF5Group | HDF5Dataset | HDF5Datatype {
  const { collection, id } = link;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (mockMetadata as HDF5Metadata)[collection]![id];
}

export function useValues(link: HDF5Link): HDF5Values {
  const { id } = link;
  return (mockValues as HDF5Values)[id];
}
