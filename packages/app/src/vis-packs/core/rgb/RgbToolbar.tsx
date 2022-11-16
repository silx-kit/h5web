import {
  GridToggler,
  ImageType,
  Separator,
  ToggleBtn,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';
import { MdAspectRatio } from 'react-icons/md';
import shallow from 'zustand/shallow';

import { getImageInteractions } from '../utils';
import { useRgbConfig } from './config';

function RgbToolbar() {
  const {
    imageType,
    keepRatio,
    showGrid,
    setImageType,
    toggleKeepRatio,
    toggleGrid,
  } = useRgbConfig((state) => state, shallow);

  return (
    <Toolbar interactions={getImageInteractions(keepRatio)}>
      <ToggleGroup
        role="radiogroup"
        ariaLabel="Image type"
        value={imageType}
        onChange={(val) => {
          setImageType(val as ImageType);
        }}
      >
        <ToggleGroup.Btn label="RGB" value={ImageType.RGB} />
        <ToggleGroup.Btn label="BGR" value={ImageType.BGR} />
      </ToggleGroup>

      <Separator />

      <ToggleBtn
        label="Keep ratio"
        icon={MdAspectRatio}
        value={keepRatio}
        onToggle={toggleKeepRatio}
      />

      <GridToggler value={showGrid} onToggle={toggleGrid} />
    </Toolbar>
  );
}

export default RgbToolbar;
