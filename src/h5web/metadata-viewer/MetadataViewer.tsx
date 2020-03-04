import React from 'react';
import { HDF5Link, HDF5Collection } from '../providers/models';
import styles from './MetadataViewer.module.css';
import { useMetadata } from '../providers/hooks';
import {
  isBaseType,
  isDataset,
  isHardLink,
  isSimpleShape,
} from '../providers/type-guards';

const ENTITY_TYPE: Record<HDF5Collection, string> = {
  [HDF5Collection.Datasets]: 'dataset',
  [HDF5Collection.Groups]: 'group',
  [HDF5Collection.Datatypes]: 'datatype',
};

interface Props {
  link: HDF5Link;
}

function MetadataViewer(props: Props): JSX.Element {
  const { link } = props;

  const metadata = useMetadata(link);

  return (
    <div className={styles.viewer}>
      <h2 className={styles.heading}>
        Metadata for {isHardLink(link) ? ENTITY_TYPE[link.collection] : 'link'}{' '}
        <code>{link.title}</code>
      </h2>
      {!!metadata && isHardLink(link) && isDataset(metadata, link) && (
        <table>
          <tbody>
            <tr>
              <th>HDF5 type</th>
              <td>
                {isBaseType(metadata.type) ? metadata.type.class : 'Complex'}
              </td>
            </tr>
            <tr>
              <th>Shape</th>
              <td>
                {isSimpleShape(metadata.shape) &&
                  metadata.shape.dims.toString()}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <pre>
        {JSON.stringify(
          metadata,
          (key, value) => (key === 'links' ? undefined : value),
          2
        )}
      </pre>
    </div>
  );
}

export default MetadataViewer;
