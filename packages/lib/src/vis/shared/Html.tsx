import { useThree } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  overflowCanvas?: boolean; // allow children to overflow above axes
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

  // Choose DOM container to which to append `renderTarget`
  // (with `canvasWrapper`, `Html` children are allowed to overflow above the axes)
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
