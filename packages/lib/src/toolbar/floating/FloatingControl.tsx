import { type NoProps } from '@h5web/shared/vis-models';
import { type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

import Html from '../../vis/shared/Html';
import { useVisCanvasContext } from '../../vis/shared/VisCanvasProvider';

function FloatingControl(props: PropsWithChildren<NoProps>) {
  const { children } = props;
  const { floatingToolbar } = useVisCanvasContext();

  if (!floatingToolbar) {
    return null;
  }

  return <Html>{createPortal(children, floatingToolbar)}</Html>;
}

export default FloatingControl;
