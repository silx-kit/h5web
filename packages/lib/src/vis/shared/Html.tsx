import { useThree } from '@react-three/fiber';
import { useState, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  container?: HTMLElement;
  children?: ReactNode;
}

function Html(props: Props) {
  const gl = useThree((state) => state.gl);
  const { container = gl.domElement.parentElement, children } = props;

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
