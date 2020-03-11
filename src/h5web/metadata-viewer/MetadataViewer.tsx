import React from 'react';
import { HDF5Collection, HDF5Link } from '../providers/models';
import styles from './MetadataViewer.module.css';
import { useEntity } from '../providers/hooks';
import { isBaseType, isDataset, isHardLink } from '../providers/type-guards';
import ShapeRenderer from './ShapeRenderer';
import AttributesRenderer from './AttributesRenderer';
import LinkInfo from './LinkInfo';

const ENTITY_TYPE: Record<HDF5Collection, string> = {
  [HDF5Collection.Datasets]: 'dataset',
  [HDF5Collection.Groups]: 'group',
  [HDF5Collection.Datatypes]: 'datatype',
};

interface Props {
  key: string;
  link: HDF5Link;
}

function MetadataViewer(props: Props): JSX.Element {
  const { link } = props;

  const entity = useEntity(link);

  return (
    <div className={styles.viewer}>
      <h2 className={styles.heading}>
        Metadata for {isHardLink(link) ? ENTITY_TYPE[link.collection] : 'link'}{' '}
        <code>{link.title}</code>
      </h2>
      <table>
        <tbody>
          <LinkInfo link={link} />
          {entity && (
            <>
              {isHardLink(link) && isDataset(entity, link) && (
                <>
                  <tr>
                    <th className={styles.table_head} colSpan={2}>
                      Dataset info
                    </th>
                  </tr>
                  <tr>
                    <th>HDF5 type</th>
                    <td>
                      {isBaseType(entity.type) ? entity.type.class : 'Complex'}
                    </td>
                  </tr>
                  <tr>
                    <th>Shape</th>
                    <td>
                      <ShapeRenderer shape={entity.shape} />
                    </td>
                  </tr>
                </>
              )}
              {'attributes' in entity && (
                <AttributesRenderer attributes={entity.attributes} />
              )}
            </>
          )}
        </tbody>
      </table>
      {entity && (
        <pre>
          {JSON.stringify(
            entity,
            (key, value) => (key === 'links' ? undefined : value),
            2
          )}
        </pre>
      )}
    </div>
  );
}

export default MetadataViewer;
