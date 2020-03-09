import React from 'react';
import { HDF5Attribute } from '../providers/models';
import styles from './MetadataViewer.module.css';

interface Props {
  attributes?: HDF5Attribute[];
}

function AttributesRenderer(props: Props): JSX.Element {
  const { attributes } = props;

  if (!attributes || attributes.length === 0) {
    return <></>;
  }

  return (
    <>
      <tr>
        <th className={styles.table_head} colSpan={2}>
          Attributes
        </th>
      </tr>
      {attributes.map(
        (attribute: HDF5Attribute): JSX.Element => {
          return (
            <tr>
              <th>{attribute.name}</th>
              <td>{attribute.value}</td>
            </tr>
          );
        }
      )}
    </>
  );
}

export default AttributesRenderer;
