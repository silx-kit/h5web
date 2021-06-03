import { MdGridOn } from 'react-icons/md';
import ToggleBtn from './ToggleBtn';

interface Props {
  value: boolean;
  onToggle: () => void;
}

function GridToggler(props: Props) {
  const { value, onToggle } = props;

  return (
    <ToggleBtn label="Grid" icon={MdGridOn} value={value} onToggle={onToggle} />
  );
}

export default GridToggler;
