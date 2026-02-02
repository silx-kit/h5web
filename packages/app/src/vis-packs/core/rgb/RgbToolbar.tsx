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
import { type RgbVisConfig } from './config';

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
    setKeepRatio,
    setShowGrid,
    setFlipXAxis,
    setFlipYAxis,
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
        Icon={MdSwapHoriz}
        value={flipXAxis}
        onToggle={() => setFlipXAxis(!flipXAxis)}
      />
      <ToggleBtn
        label="Y"
        aria-label="Flip Y"
        Icon={MdSwapVert}
        value={flipYAxis}
        onToggle={() => setFlipYAxis(!flipYAxis)}
      />

      <ToggleBtn
        label="Keep ratio"
        Icon={MdAspectRatio}
        value={keepRatio}
        onToggle={() => setKeepRatio(!keepRatio)}
      />

      <ToggleBtn
        label="Grid"
        Icon={MdGridOn}
        value={showGrid}
        onToggle={() => setShowGrid(!showGrid)}
      />
    </Toolbar>
  );
}

export default RgbToolbar;
