import React from 'react';
import { HDF5Link } from '../providers/models';
import { useEntity } from '../providers/hooks';
import AttributesInfo from './AttributesInfo';
import LinkInfo from './LinkInfo';
import EntityInfo from './EntityInfo';

interface Props {
  key: string;
  link: HDF5Link;
}

function MetadataViewer(props: Props): JSX.Element {
  const { link } = props;

  const entity = useEntity(link);

  return (
    <>
      <LinkInfo link={link} />
      {entity && <EntityInfo entity={entity} />}
      {entity && 'attributes' in entity && (
        <AttributesInfo attributes={entity.attributes} />
      )}
    </>
  );
}

export default MetadataViewer;
