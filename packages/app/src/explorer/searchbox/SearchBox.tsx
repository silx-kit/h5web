import { assertDefined } from '@h5web/shared';
import { useState } from 'react';
import { FiArrowLeftCircle, FiArrowRightCircle } from 'react-icons/fi';

import { getNameFromPath } from '../../providers/utils';
import styles from './SearchBox.module.css';

interface Props {
  paths: string[];
  onSelect: (path: string) => void;
}

function SearchBox(props: Props) {
  const { paths, onSelect } = props;
  const [value, setValue] = useState<string>('');
  const [index, setIndex] = useState<number | undefined>();

  const matches = value
    ? paths.filter((path) => getNameFromPath(path).includes(value))
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={value}
          placeholder="Search for an entity"
          onChange={(e) => {
            setValue(e.target.value);
            setIndex(undefined);
          }}
          type="text"
          aria-label="Path to search"
          onKeyDown={(e) => {
            if (e.key !== 'Enter' || matches.length <= 0) {
              return;
            }
            const newIndex =
              index !== undefined ? Math.min(index + 1, matches.length - 1) : 0;

            setIndex(newIndex);
            onSelect(matches[newIndex]);
          }}
        />
        <button
          className={styles.btn}
          type="button"
          disabled={index === undefined || index <= 0}
          onClick={() => {
            assertDefined(index);
            setIndex(index - 1);
            onSelect(matches[index - 1]);
          }}
          aria-label="Select previous match"
        >
          <span className={styles.btnLike}>
            <FiArrowLeftCircle />
          </span>
        </button>
        <button
          className={styles.btn}
          type="button"
          disabled={
            (index !== undefined && index >= matches.length - 1) ||
            matches.length === 0
          }
          onClick={() => {
            if (matches.length <= 0) {
              return;
            }
            const newIndex =
              index !== undefined ? Math.min(index + 1, matches.length - 1) : 0;
            setIndex(newIndex);
            onSelect(matches[newIndex]);
          }}
          aria-label={`Select ${index === undefined ? 'first' : 'next'} match`}
        >
          <span className={styles.btnLike}>
            <FiArrowRightCircle />
          </span>
        </button>
        {value && (
          <div
            className={styles.matchCount}
            data-noMatch={matches.length === 0 ? '' : undefined}
          >
            {index === undefined
              ? `${matches.length} matches`
              : `${index + 1}/${matches.length}`}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBox;
