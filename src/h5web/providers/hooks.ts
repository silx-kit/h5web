import {
  HDF5Link,
  HDF5Dataset,
  HDF5Datatype,
  HDF5Group,
  HDF5HardLink,
} from './models';
import mockMetadata from '../../demo-app/mock-data/metadata.json';
import mockValues from '../../demo-app/mock-data/values.json';
import {
  MockHDF5Metadata,
  MockHDF5Values,
} from '../../demo-app/mock-data/models';
import { isHardLink } from './type-guards';

export function useMetadata(
  link: HDF5Link
): HDF5Group | HDF5Dataset | HDF5Datatype | undefined {
  if (!isHardLink(link)) {
    return undefined;
  }

  const { collection, id } = link;
  return (mockMetadata as MockHDF5Metadata)[collection]![id]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
}

export function useValues(link: HDF5HardLink): MockHDF5Values {
  const { id } = link;
  return (mockValues as MockHDF5Values)[id];
}
