import { assertNonNull } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import type { PropsWithChildren } from 'react';
import { useLayoutEffect, useState } from 'react';
import ReactDOM, { createPortal } from 'react-dom';

interface Props {
  overflowCanvas?: boolean;
}

function Html(props: PropsWithChildren<Props>) {
  const { overflowCanvas = false, children } = props;

  const r3fRoot = useThree((state) => state.gl.domElement.parentElement);
  assertNonNull(r3fRoot);

  const canvasWrapper = r3fRoot.parentElement;
  assertNonNull(canvasWrapper);

  const portalContainer = overflowCanvas ? canvasWrapper : r3fRoot;

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
