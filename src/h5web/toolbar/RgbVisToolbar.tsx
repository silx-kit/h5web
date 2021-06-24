import { MdAspectRatio } from 'react-icons/md';
import ToggleBtn from './controls/ToggleBtn';
import Toolbar from './Toolbar';
import shallow from 'zustand/shallow';
import GridToggler from './controls/GridToggler';
import { useRgbVisConfig } from '../vis-packs/core/rgb/config';

function RgbVisToolbar() {
  const { layout, setLayout, showGrid, toggleGrid } = useRgbVisConfig(
    (state) => state,
    shallow
  );

  return (
    <Toolbar>
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

export default RgbVisToolbar;
