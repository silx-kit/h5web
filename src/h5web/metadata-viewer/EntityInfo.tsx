import React from 'react';
import { HDF5GenericEntity, HDF5Collection } from '../providers/models';
import styles from './MetadataViewer.module.css';
import { isBaseType, isSimpleShape } from '../providers/type-guards';
import { renderShapeDims } from './utils';

interface Props {
  entity: HDF5GenericEntity;
}

function EntityInfo(props: Props): JSX.Element {
  const { entity } = props;
  const { collection } = entity;

  if (collection === HDF5Collection.Groups) {
    return <></>;
  }

  const entityKind =
    collection.charAt(0).toUpperCase() +
    collection.substr(1, collection.length - 2);

  return (
    <>
      <tr>
        <th className={styles.headingCell} colSpan={2}>
          {entityKind} info
        </th>
      </tr>
      {'type' in entity && (
        <tr>
          <th scope="row">Type</th>
          <td>{isBaseType(entity.type) ? entity.type.class : 'Complex'}</td>
        </tr>
      )}
      {'shape' in entity && (
        <tr>
          <th scope="row">Shape</th>
          <td>
            {isSimpleShape(entity.shape)
              ? renderShapeDims(entity.shape.dims)
              : entity.shape.class}
          </td>
        </tr>
      )}
    </>
  );
}

export default EntityInfo;
