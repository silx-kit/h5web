import { MdSwapVert } from 'react-icons/md';

import ToggleBtn from './ToggleBtn';

interface Props {
  value: boolean;
  onToggle: () => void;
}

/**
 * @deprecated Use `ToggleBtn` directly instead
 */
function FlipYAxisToggler(props: Props) {
  const { value, onToggle } = props;

  return (
    <ToggleBtn
      label="Flip Y"
      icon={MdSwapVert}
      value={value}
      onToggle={onToggle}
    />
  );
}

export default FlipYAxisToggler; // eslint-disable-line etc/no-deprecated
