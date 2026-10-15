import {
  type PropsWithChildren,
  type ReactPortal,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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

  const rootRef = useRef<Root>(null);
  const portalRef = useRef<ReactPortal>(null);

  useLayoutEffect(() => {
    const portal = createPortal(children, portalContainer);
    portalRef.current = portal;
    rootRef.current?.render(portal);
  }, [children, portalContainer]);

  useLayoutEffect(() => {
    /* Since the children are rendered in a portal, it doesn't technically matter
       which element `reactRootContainer` is appended to, as long as it stays in the DOM. */
    r3fRoot.append(reactRootContainer);

    const root = createRoot(reactRootContainer);
    rootRef.current = root;
    root.render(portalRef.current); // render latest children in new root

    return () => {
      rootRef.current = null;
      root.unmount();
      reactRootContainer.remove();
    };
  }, [r3fRoot, reactRootContainer]);

  return null;
}

export default Html;
