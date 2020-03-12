import React from 'react';
import { HDF5Attribute } from '../providers/models';
import styles from './MetadataViewer.module.css';

interface Props {
  attributes?: HDF5Attribute[];
}

function AttributesInfo(props: Props): JSX.Element {
  const { attributes } = props;

  if (!attributes || attributes.length === 0) {
    return <></>;
  }

  return (
    <>
      <tr>
        <th className={styles.headingCell} colSpan={2}>
          Attributes
        </th>
      </tr>
      {attributes.map(
        ({ name, value }: HDF5Attribute): JSX.Element => (
          <tr key={name}>
            <th>{name}</th>
            <td>{value}</td>
          </tr>
        )
      )}
    </>
  );
}

export default AttributesInfo;
