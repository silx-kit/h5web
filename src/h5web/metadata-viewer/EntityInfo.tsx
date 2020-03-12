import React from 'react';
import { HDF5GenericEntity } from '../providers/models';
import styles from './MetadataViewer.module.css';
import { isBaseType, isSimpleShape } from '../providers/type-guards';
import { renderShapeDims } from './utils';
import RawInspector from './RawInspector';

interface Props {
  entity: HDF5GenericEntity;
}

function EntityInfo(props: Props): JSX.Element {
  const { entity } = props;
  const { collection } = entity;

  const entityKind =
    collection.charAt(0).toUpperCase() +
    collection.substr(1, collection.length - 2);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th colSpan={2}>{entityKind} info</th>
        </tr>
      </thead>
      <tbody>
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
        <tr>
          <th scope="row">Raw</th>
          <td className={styles.raw}>
            <RawInspector data={entity} />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default EntityInfo;
