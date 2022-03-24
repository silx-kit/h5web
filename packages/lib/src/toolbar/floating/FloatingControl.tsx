import type { ReactNode } from 'react';
import { useContext } from 'react';
import { createPortal } from 'react-dom';

import { AxisSystemContext } from '../../vis/shared/AxisSystemContext';
import Html from '../../vis/shared/Html';

interface Props {
  children?: ReactNode;
}

function FloatingControl(props: Props) {
  const { children } = props;
  const { floatingToolbar } = useContext(AxisSystemContext);

  if (!floatingToolbar) {
    return null;
  }

  return <Html>{createPortal(children, floatingToolbar)}</Html>;
}

export default FloatingControl;
