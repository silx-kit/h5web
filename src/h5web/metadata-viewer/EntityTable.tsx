import { useContext } from 'react';
import { Entity, EntityKind } from '../providers/models';
import styles from './MetadataViewer.module.css';
import { isDataset, isDatatype } from '../guards';
import { renderType, renderShape } from './utils';
import RawInspector from './RawInspector';
import { capitalize } from 'lodash';
import { ProviderContext } from '../providers/context';

interface Props {
  entity: Entity;
}

function EntityTable(props: Props) {
  const { entity } = props;
  const { name, path, kind } = entity;
  const { filepath } = useContext(ProviderContext);

  const isRoot = path === '/';

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col" colSpan={2}>
            {kind === EntityKind.Unresolved ? 'Entity' : capitalize(kind)}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Path</th>
          <td>{path}</td>
        </tr>
        <tr>
          <th scope="row">{isRoot ? 'File path' : 'Name'}</th>
          <td>{isRoot ? filepath : name}</td>
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
            <td>{renderShape(entity.shape)}</td>
          </tr>
        )}
        {entity.link && entity.link.path && (
          <tr>
            <th scope="row">{entity.link.class} link</th>
            <td>
              {entity.link.file && `${entity.link.file}:`}
              {entity.link.path}
            </td>
          </tr>
        )}
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
