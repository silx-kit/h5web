import React from 'react';
import { HDF5Link } from '../providers/models';
import styles from './MetadataViewer.module.css';
import { useEntity } from '../providers/hooks';
import AttributesInfo from './AttributesInfo';
import LinkInfo from './LinkInfo';
import RawInfo from './RawInfo';
import EntityInfo from './EntityInfo';

interface Props {
  key: string;
  link: HDF5Link;
}

function MetadataViewer(props: Props): JSX.Element {
  const { link } = props;

  const entity = useEntity(link);

  return (
    <div className={styles.viewer}>
      <table>
        <tbody>
          <LinkInfo link={link} />
          {entity && <EntityInfo entity={entity} />}
          {entity && 'attributes' in entity && (
            <AttributesInfo attributes={entity.attributes} />
          )}
        </tbody>
      </table>
      <RawInfo link={link} entity={entity} />
    </div>
  );
}

export default MetadataViewer;
