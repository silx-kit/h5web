import { ReactElement, useContext } from 'react';
import type { Entity } from '../providers/models';
import styles from './MetadataViewer.module.css';
import { hasSimpleShape, isDataset, isDatatype, isLink } from '../guards';
import { renderType, renderShapeDims } from './utils';
import RawInspector from './RawInspector';
import LinkInfo from './LinkInfo';
import { capitalize } from 'lodash-es';
import { ProviderContext } from '../providers/context';

interface Props {
  entity: Entity;
}

function EntityTable(props: Props): ReactElement {
  const { entity } = props;
  const { name, path, kind } = entity;
  const { filepath } = useContext(ProviderContext);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col" colSpan={2}>
            {capitalize(kind)}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Path</th>
          <td>{path}</td>
        </tr>
        <tr>
          <th scope="row">Name</th>
          <td>{path === '/' ? filepath : name}</td>
        </tr>
        {(isDataset(entity) || isDatatype(entity)) && (
          <tr>
            <th scope="row">Type</th>
            <td>{renderType(entity.type)}</td>
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
