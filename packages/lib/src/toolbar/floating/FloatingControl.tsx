import { type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

import Html from '../../vis/shared/Html';
import { useVisCanvasContext } from '../../vis/shared/VisCanvasProvider';

interface Props {}

function FloatingControl(props: PropsWithChildren<Props>) {
  const { children } = props;
  const { floatingToolbar } = useVisCanvasContext();

  if (!floatingToolbar) {
    return null;
  }

  return <Html>{createPortal(children, floatingToolbar)}</Html>;
}

export default FloatingControl;
