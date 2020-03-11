import {
  HDF5Collection,
  HDF5Entity,
  HDF5HardLink,
  HDF5Link,
  HDF5LinkClass,
  HDF5SimpleShape,
  HDF5Shape,
  HDF5ShapeClass,
  HDF5BaseType,
  HDF5Type,
  HDF5TypeClass,
  HDF5GenericEntity,
} from './models';

export function isHardLink(link: HDF5Link): link is HDF5HardLink {
  return link.class === HDF5LinkClass.Hard;
}

export function isDataset(
  entity: HDF5GenericEntity
): entity is HDF5Entity<HDF5Collection.Datasets> {
  return entity.collection === HDF5Collection.Datasets;
}

export function isSimpleShape(shape: HDF5Shape): shape is HDF5SimpleShape {
  return shape.class === HDF5ShapeClass.Simple;
}

export function isBaseType(type: HDF5Type): type is HDF5BaseType {
  return (
    typeof type !== 'string' &&
    [HDF5TypeClass.Integer, HDF5TypeClass.Float, HDF5TypeClass.String].includes(
      type.class
    )
  );
}
