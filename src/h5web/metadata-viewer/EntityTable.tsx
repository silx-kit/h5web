import React, { ReactElement } from 'react';
import type { MyHDF5Entity } from '../providers/models';
import styles from './MetadataViewer.module.css';
import {
  hasMySimpleShape,
  isDataset,
  isDatatype,
  isLink,
  isResolved,
} from '../providers/utils';
import { renderShapeDims } from './utils';
import RawInspector from './RawInspector';
import LinkInfo from './LinkInfo';
import { capitalize } from 'lodash-es';

interface Props {
  entity: MyHDF5Entity;
}

function EntityTable(props: Props): ReactElement {
  const { entity } = props;
  const { name, kind, parents } = entity;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th colSpan={2}>{capitalize(kind)}</th>
        </tr>
      </thead>
      <tbody>
        {isResolved(entity) && (
          <tr>
            <th scope="row">ID</th>
            <td>{entity.id}</td>
          </tr>
        )}
        <tr>
          <th scope="row">Name</th>
          <td>{name}</td>
        </tr>
        <tr>
          <th scope="row">Path</th>
          <td>
            /
            {[...parents, entity]
              .slice(1)
              .map(({ name }) => name)
              .join('/')}
          </td>
        </tr>
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
              {hasMySimpleShape(entity)
                ? renderShapeDims(entity.shape.dims)
                : entity.shape.class}
            </td>
          </tr>
        )}
        {isLink(entity) && entity.rawLink && <LinkInfo link={entity.rawLink} />}
        <tr>
          <th scope="row">Raw</th>
          <td className={styles.raw}>
            <RawInspector entity={entity} />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default EntityTable;
