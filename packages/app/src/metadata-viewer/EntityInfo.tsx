import { isDataset, isDatatype } from '@h5web/shared';
import type { Entity } from '@h5web/shared';
import { useContext } from 'react';

import { ProviderContext } from '../providers/context';
import styles from './MetadataViewer.module.css';
import RawInspector from './RawInspector';
import { renderType, renderShape } from './utils';

interface Props {
  entity: Entity;
}

function EntityInfo(props: Props) {
  const { entity } = props;
  const { name, path } = entity;
  const { filepath } = useContext(ProviderContext);

  const isRoot = path === '/';

  return (
    <>
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
      {entity.link?.path && (
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
    </>
  );
}

export default EntityInfo;
