import { assertDefined, Menu, RadioGroup, Separator } from '@h5web/lib';
import { createPortal } from 'react-dom';
import { MdLineAxis } from 'react-icons/md';

import { type DatasetDef } from './models';
import styles from './NxHeatmapSignalPicker.module.css';

interface Props {
  definitions: DatasetDef[];
  toolbarContainer: HTMLDivElement | undefined;
  value: DatasetDef;
  onChange: (def: DatasetDef) => void;
}

function NxHeatmapSignalPicker(props: Props) {
  const { definitions, toolbarContainer, value, onChange } = props;

  if (!toolbarContainer) {
    return null;
  }

  return createPortal(
    <div className={styles.wrapper}>
      <Separator />

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

export default NxHeatmapSignalPicker;
