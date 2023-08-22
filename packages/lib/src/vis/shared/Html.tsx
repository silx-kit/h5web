import type { PropsWithChildren } from 'react';
import { useLayoutEffect, useState } from 'react';
import ReactDOM, { createPortal } from 'react-dom';

import { useVisCanvasContext } from './VisCanvasProvider';

interface Props {
  overflowCanvas?: boolean;
}

function Html(props: PropsWithChildren<Props>) {
  const { overflowCanvas = false, children } = props;

  const { r3fRoot, canvasArea } = useVisCanvasContext();
  const portalContainer = overflowCanvas ? canvasArea : r3fRoot;

  const [renderContainer] = useState(() => {
    const div = document.createElement('div');
    div.setAttribute('hidden', '');
    return div;
  });

  useLayoutEffect(() => {
    ReactDOM.render(createPortal(children, portalContainer), renderContainer);
  }, [children, portalContainer, renderContainer]);

  useLayoutEffect(() => {
    /* Since the children are rendered in a portal, it doesn't technically matter
       which element `renderContainer` is appended to, as long as it stays in the DOM. */
    r3fRoot.append(renderContainer);

    return () => {
      ReactDOM.unmountComponentAtNode(renderContainer);
      renderContainer.remove();
    };
  }, [r3fRoot, renderContainer]);

  return null;
}

export default Html;
