import type { BtnProps } from './Btn';
import Btn from './Btn';

interface Props extends Omit<BtnProps, 'onClick'> {
  value: boolean;
  onToggle: () => void;
}

function ToggleBtn(props: Props) {
  const { value, onToggle, ...btnProps } = props;
  return <Btn {...btnProps} aria-pressed={value} onClick={() => onToggle()} />;
}

export default ToggleBtn;
