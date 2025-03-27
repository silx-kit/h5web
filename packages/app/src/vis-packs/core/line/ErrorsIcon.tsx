import { type IconBaseProps } from 'react-icons';
import { FiItalic } from 'react-icons/fi';

function ErrorsIcon(props: IconBaseProps) {
  return (
    <FiItalic
      transform="skewX(20)"
      style={{ marginLeft: '-0.25em', marginRight: '0.0625rem' }}
      {...props}
    />
  );
}

export default ErrorsIcon;
