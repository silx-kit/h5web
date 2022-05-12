import { useThree } from '@react-three/fiber';
import { useState, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  overflowCanvas?: boolean;
  container?: HTMLElement;
  children?: ReactNode;
}

function Html(props: Props) {
  const {
    overflowCanvas = false,
    container: customContainer,
    children,
  } = props;

  const r3fRoot = useThree((state) => state.gl.domElement.parentElement);
  const canvasWrapper = r3fRoot?.parentElement;

  // Choose DOM container in which to append `renderTarget`
  // (`r3fRoot` hides overflow but its parent, `canvasWrapper`, does not -- cf. `VisCanvas`)
  const container =
    customContainer || (overflowCanvas ? canvasWrapper : r3fRoot);

  const [renderTarget] = useState(() => document.createElement('div'));

  useLayoutEffect(() => {
    ReactDOM.render(<>{children}</>, renderTarget); // eslint-disable-line react/jsx-no-useless-fragment
  }, [children, renderTarget]);

  useLayoutEffect(() => {
    return () => {
      ReactDOM.unmountComponentAtNode(renderTarget);
    };
  }, [renderTarget]);

  useLayoutEffect(() => {
    container?.append(renderTarget);

    return () => {
      renderTarget.remove();
    };
  }, [container, renderTarget]);

  return null;
}

export default Html;
