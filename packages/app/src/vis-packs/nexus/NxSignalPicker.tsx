import { assertDefined, Menu, RadioGroup } from '@h5web/lib';
import {
  type ComplexType,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import { createPortal } from 'react-dom';
import { MdLineAxis } from 'react-icons/md';

import { type DatasetDef } from './models';
import styles from './NxSignalPicker.module.css';

interface Props<T extends NumericLikeType | ComplexType> {
  definitions: DatasetDef<T>[];
  toolbarContainer: HTMLDivElement | undefined;
  value: DatasetDef<T>;
  onChange: (def: DatasetDef<T>) => void;
}

function NxSignalPicker<T extends NumericLikeType | ComplexType>(
  props: Props<T>,
) {
  const { definitions, toolbarContainer, value, onChange } = props;

  if (!toolbarContainer) {
    return null;
  }

  return createPortal(
    <div className={styles.wrapper}>
      <Menu label="Signals" Icon={MdLineAxis}>
        <RadioGroup
          name="signals"
          options={definitions.map((def) => def.dataset.name)}
          value={value.dataset.name}
          onChange={(name) => {
            const selection = definitions.find((s) => s.dataset.name === name);
            assertDefined(selection);
            onChange(selection);
          }}
        />
      </Menu>
    </div>,
    toolbarContainer,
  );
}

export default NxSignalPicker;
