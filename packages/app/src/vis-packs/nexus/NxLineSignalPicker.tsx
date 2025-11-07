import { Checkbox, Menu, MenuSeparator, Separator } from '@h5web/lib';
import { createPortal } from 'react-dom';
import { MdLineAxis } from 'react-icons/md';

import styles from './NxLineSignalPicker.module.css';

interface Props {
  signalLabel: string;
  signalChecked: boolean;
  auxLabels: string[];
  auxChecked: boolean[];
  onSignalChange: (newValue: boolean) => void;
  onAuxChange: (newValue: boolean[]) => void;
  toolbarContainer: HTMLDivElement | undefined;
}

function NxLineSignalPicker(props: Props) {
  const {
    signalLabel,
    signalChecked,
    auxLabels,
    auxChecked,
    onSignalChange,
    onAuxChange,
    toolbarContainer,
  } = props;

  if (!toolbarContainer) {
    return null;
  }

  const someAuxChecked = auxChecked.some(Boolean);
  const allAuxChecked = auxChecked.every(Boolean);

  return createPortal(
    <div className={styles.wrapper}>
      <Separator />

      <Menu label="Signals" Icon={MdLineAxis}>
        <Checkbox
          label={signalLabel}
          checked={signalChecked}
          onChange={onSignalChange}
        />

        <MenuSeparator />
        <Checkbox
          className={styles.allAuxOption}
          label="Auxiliary signals"
          checked={allAuxChecked}
          indeterminate={someAuxChecked && !allAuxChecked}
          onChange={() => {
            onAuxChange(auxChecked.map(() => !allAuxChecked));
          }}
        />

        {auxLabels.map((label, index) => {
          return (
            <Checkbox
              key={label}
              label={label}
              checked={auxChecked[index]}
              onChange={(checked) => {
                const newValue = [...auxChecked];
                newValue[index] = checked;
                onAuxChange(newValue);
              }}
            />
          );
        })}
      </Menu>
    </div>,
    toolbarContainer,
  );
}

export default NxLineSignalPicker;
