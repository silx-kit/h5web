import { type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

import Html from '../../vis/shared/Html';
import { useVisCanvasContext } from '../../vis/shared/VisCanvasProvider';

interface Props {}

function SvgElement(props: PropsWithChildren<Props>) {
  const { children } = props;
  const { svgOverlay } = useVisCanvasContext();

  if (!svgOverlay) {
    return null;
  }

  return <Html>{createPortal(children, svgOverlay)}</Html>;
}

export type { Props as SvgElementProps };
export default SvgElement;
