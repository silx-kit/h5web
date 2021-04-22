import {
  Attribute,
  ComplexArray,
  DTypeClass,
  H5WebComplex,
} from '../providers/models';
import AttributeValueLink from './AttributeValueLink';
import styles from './MetadataViewer.module.css';
import { formatComplex } from './utils';

const FOLLOWABLE_ATTRS = new Set([
  'default',
  'signal',
  'axes',
  'auxiliary_signals',
]);

interface Props {
  attributes: Attribute[];
  onFollowPath: (path: string) => void;
}

function AttributesTable(props: Props) {
  const { attributes, onFollowPath } = props;

  if (attributes.length === 0) {
    return null;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col" colSpan={2}>
            Attributes
          </th>
        </tr>
      </thead>
      <tbody>
        {attributes.map(({ name, type, value }) => (
          <tr key={name}>
            <th scope="row">{name}</th>
            <td>
              {FOLLOWABLE_ATTRS.has(name) ? (
                <AttributeValueLink onFollowPath={onFollowPath} value={value} />
              ) : type.class === DTypeClass.Complex ? (
                formatComplex(value as H5WebComplex | ComplexArray)
              ) : (
                JSON.stringify(value)
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AttributesTable;
