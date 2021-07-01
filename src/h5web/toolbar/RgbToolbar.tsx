import { MdAspectRatio } from 'react-icons/md';
import ToggleBtn from './controls/ToggleBtn';
import Toolbar from './Toolbar';
import shallow from 'zustand/shallow';
import GridToggler from './controls/GridToggler';
import { useRgbVisConfig } from '../vis-packs/core/rgb/config';
import { ImageType } from '../vis-packs/core/rgb/models';
import ToggleGroup from './controls/ToggleGroup';

function RgbToolbar() {
  const { layout, setLayout, showGrid, toggleGrid, imageType, setImageType } =
    useRgbVisConfig((state) => state, shallow);

  return (
    <Toolbar>
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

      <ToggleBtn
        label="Keep ratio"
        icon={MdAspectRatio}
        value={layout === 'cover'}
        onToggle={() => setLayout(layout === 'cover' ? 'fill' : 'cover')}
      />

      <GridToggler value={showGrid} onToggle={toggleGrid} />
    </Toolbar>
  );
}

export default RgbToolbar;
