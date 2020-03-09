import React from 'react';
import { HDF5Attribute } from '../providers/models';
import styles from './MetadataViewer.module.css';

interface Props {
  attributes: HDF5Attribute[] | undefined;
}

function AttributesRenderer(props: Props): JSX.Element {
  const { attributes } = props;

  return (
    <>
      <tr>
        <th className={styles.table_head} colSpan={2}>
          Attributes
        </th>
      </tr>
      {attributes &&
        attributes.map(
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
