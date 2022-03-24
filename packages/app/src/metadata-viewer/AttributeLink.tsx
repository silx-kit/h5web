import { Fragment } from 'react';
import { FiChevronsRight } from 'react-icons/fi';

import styles from './MetadataViewer.module.css';

interface Props {
  onFollowPath: (value: string) => void;
  value: unknown;
}

function AttributeLink(props: Props) {
  const { onFollowPath, value } = props;

  if (Array.isArray(value)) {
    return (
      <div className={styles.attrValueWrapper}>
        <span>[</span>
        {value.map((val, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            <AttributeLink onFollowPath={onFollowPath} value={val} />
            {i < value.length - 1 && <span>,</span>}
          </Fragment>
        ))}
        <span>]</span>
      </div>
    );
  }

  if (typeof value === 'string' && value !== '.') {
    return (
      <button
        className={styles.attrValueBtn}
        type="button"
        aria-label={`Inspect ${value}`}
        onClick={() => onFollowPath(value)}
      >
        {value}
        <FiChevronsRight />
      </button>
    );
  }

  return (
    <>
      {JSON.stringify(value, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
      )}
    </>
  );
}

export default AttributeLink;
