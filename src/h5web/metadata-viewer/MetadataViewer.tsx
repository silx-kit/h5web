import React from 'react';
import { HDF5Link, HDF5Entity } from '../providers/models';
import AttributesInfo from './AttributesInfo';
import LinkInfo from './LinkInfo';
import EntityInfo from './EntityInfo';

interface Props {
  key: string;
  link: HDF5Link;
  entity?: HDF5Entity;
}

function MetadataViewer(props: Props): JSX.Element {
  const { link, entity } = props;

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

// Optimise consecutive renders when selecting a link in the explorer
export default React.memo(MetadataViewer);
