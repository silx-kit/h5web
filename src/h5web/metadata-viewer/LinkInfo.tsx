import React from 'react';
import { HDF5Link, HDF5LinkClass } from '../providers/models';

import styles from './MetadataViewer.module.css';
import RawInspector from './RawInspector';

interface Props {
  link: HDF5Link;
}

function LinkInfo(props: Props): JSX.Element {
  const { link } = props;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th colSpan={2}>Link info</th>
        </tr>
      </thead>
      <tbody>
        {link.class !== HDF5LinkClass.Root && (
          <>
            <tr>
              <th scope="row">Title</th>
              <td>{link.title}</td>
            </tr>
            <tr>
              <th scope="row">Class</th>
              <td>{link.class}</td>
            </tr>
          </>
        )}
        {'collection' in link && (
          <tr>
            <th scope="row">Collection</th>
            <td>{link.collection}</td>
          </tr>
        )}
        {'id' in link && (
          <tr>
            <th scope="row">Entity ID</th>
            <td>{link.id}</td>
          </tr>
        )}
        {'file' in link && (
          <tr>
            <th scope="row">File</th>
            <td>{link.file}</td>
          </tr>
        )}
        {'h5path' in link && (
          <tr>
            <th scope="row">Path</th>
            <td>{link.h5path}</td>
          </tr>
        )}
        <tr>
          <th scope="row">Raw</th>
          <td className={styles.raw}>
            <RawInspector data={link} />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default LinkInfo;
