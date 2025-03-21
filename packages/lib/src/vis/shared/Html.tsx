import { type PropsWithChildren, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

import { useVisCanvasContext } from './VisCanvasProvider';

interface Props {
  overflowCanvas?: boolean;
}

function Html(props: PropsWithChildren<Props>) {
  const { overflowCanvas = false, children } = props;

  const { r3fRoot, canvasArea } = useVisCanvasContext();
  const portalContainer = overflowCanvas ? canvasArea : r3fRoot;

  const [reactRootContainer] = useState(() => {
    const div = document.createElement('div');
    div.setAttribute('hidden', '');
    return div;
  });

  const [reactRoot] = useState<Root>(() => createRoot(reactRootContainer));

  useLayoutEffect(() => {
    reactRoot.render(createPortal(children, portalContainer));
  }, [children, portalContainer, reactRoot]);

  useLayoutEffect(() => {
    /* Since the children are rendered in a portal, it doesn't technically matter
       which element `reactRootContainer` is appended to, as long as it stays in the DOM. */
    r3fRoot.append(reactRootContainer);

    return () => {
      reactRoot.unmount();
      reactRootContainer.remove();
    };
  }, [r3fRoot, reactRoot, reactRootContainer]);

  return null;
}

export default Html;
