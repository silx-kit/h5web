import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import Html from '../vis/shared/Html';
import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';

interface Props {
  children?: ReactNode;
}

function SvgElement(props: Props) {
  const { children } = props;
  const { svgOverlay } = useVisCanvasContext();

  if (!svgOverlay) {
    return null;
  }

  return <Html>{createPortal(children, svgOverlay)}</Html>;
}

export default SvgElement;
