import { isComplexValue } from '@h5web/shared/guards';
import type { ProvidedEntity } from '@h5web/shared/models-hdf5';

import { useDataContext } from '../providers/DataProvider';
import AttributeLink from './AttributeLink';
import { renderComplex } from './utils';

const FOLLOWABLE_ATTRS = new Set([
  'default',
  'signal',
  'axes',
  'auxiliary_signals',
]);

interface Props {
  entity: ProvidedEntity;
  onFollowPath: (path: string) => void;
}

function AttributesInfo(props: Props) {
  const { entity, onFollowPath } = props;

  const { attrValuesStore } = useDataContext();
  const attrValues = attrValuesStore.get(entity);

  return (
    <>
      {entity.attributes.map(({ name, type }) => {
        const value = attrValues[name];
        return (
          <tr key={name}>
            <th scope="row">{name}</th>
            <td>
              {FOLLOWABLE_ATTRS.has(name) ? (
                <AttributeLink onFollowPath={onFollowPath} value={value} />
              ) : isComplexValue(type, value) ? (
                renderComplex(value)
              ) : (
                JSON.stringify(value)
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}

export default AttributesInfo;
