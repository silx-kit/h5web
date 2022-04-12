import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useAxisSystemContext } from '../../vis/shared/AxisSystemContext';
import Html from '../../vis/shared/Html';

interface Props {
  children?: ReactNode;
}

function FloatingControl(props: Props) {
  const { children } = props;
  const { floatingToolbar } = useAxisSystemContext();

  if (!floatingToolbar) {
    return null;
  }

  return <Html>{createPortal(children, floatingToolbar)}</Html>;
}

export default FloatingControl;
