import React, { ReactElement } from 'react';
import type { HDF5Entity } from '../providers/models';
import styles from './MetadataViewer.module.css';
import { isDataset, isDatatype, hasSimpleShape } from '../providers/utils';
import { renderShapeDims } from './utils';
import RawInspector from './RawInspector';

interface Props {
  entity: HDF5Entity;
}

function EntityInfo(props: Props): ReactElement {
  const { entity } = props;
  const { collection } = entity;

  const entityKind =
    collection.charAt(0).toUpperCase() + collection.slice(1, -1);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th colSpan={2}>{entityKind} info</th>
        </tr>
      </thead>
      <tbody>
        {(isDataset(entity) || isDatatype(entity)) && (
          <tr>
            <th scope="row">Type</th>
            <td>
              {typeof entity.type === 'string'
                ? entity.type
                : entity.type.class}
            </td>
          </tr>
        )}
        {isDataset(entity) && (
          <tr>
            <th scope="row">Shape</th>
            <td>
              {hasSimpleShape(entity)
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
