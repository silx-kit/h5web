import { type NoProps } from '@h5web/shared/vis-models';
import { type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

import Html from '../../vis/shared/Html';
import { useVisCanvasContext } from '../../vis/shared/VisCanvasProvider';

function SvgElement(props: PropsWithChildren<NoProps>) {
  const { children } = props;
  const { svgOverlay } = useVisCanvasContext();

  if (!svgOverlay) {
    return null;
  }

  return <Html>{createPortal(children, svgOverlay)}</Html>;
}

export default SvgElement;
