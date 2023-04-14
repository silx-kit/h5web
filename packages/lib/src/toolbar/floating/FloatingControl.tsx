import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import Html from '../../vis/shared/Html';
import { useVisCanvasContext } from '../../vis/shared/VisCanvasProvider';

interface Props {
  children?: ReactNode;
}

function FloatingControl(props: Props) {
  const { children } = props;
  const { floatingToolbar } = useVisCanvasContext();

  if (!floatingToolbar) {
    return null;
  }

  return <Html>{createPortal(children, floatingToolbar)}</Html>;
}

export default FloatingControl;
