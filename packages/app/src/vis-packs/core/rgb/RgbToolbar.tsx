import {
  ImageType,
  Separator,
  ToggleBtn,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';
import {
  MdAspectRatio,
  MdGridOn,
  MdSwapHoriz,
  MdSwapVert,
} from 'react-icons/md';

import { getImageInteractions } from '../utils';
import type { RgbVisConfig } from './config';

interface Props {
  config: RgbVisConfig;
}

function RgbToolbar(props: Props) {
  const { config } = props;
  const {
    imageType,
    keepRatio,
    showGrid,
    flipXAxis,
    flipYAxis,
    setImageType,
    toggleKeepRatio,
    toggleGrid,
    toggleXAxisFlip,
    toggleYAxisFlip,
  } = config;

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
        label="X"
        aria-label="Flip X"
        icon={MdSwapHoriz}
        value={flipXAxis}
        onToggle={toggleXAxisFlip}
      />
      <ToggleBtn
        label="Y"
        aria-label="Flip Y"
        icon={MdSwapVert}
        value={flipYAxis}
        onToggle={toggleYAxisFlip}
      />

      <ToggleBtn
        label="Keep ratio"
        icon={MdAspectRatio}
        value={keepRatio}
        onToggle={toggleKeepRatio}
      />

      <ToggleBtn
        label="Grid"
        icon={MdGridOn}
        value={showGrid}
        onToggle={toggleGrid}
      />
    </Toolbar>
  );
}

export default RgbToolbar;
