import React, { useState, useEffect, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import { useThree } from 'react-three-fiber';

// Simplified version of `drei`'s `<Html>` component
// https://github.com/pmndrs/drei/blob/master/src/misc/Html.tsx
function Html(props: React.HTMLAttributes<HTMLDivElement>): ReactElement {
  const { className, style, children, ...divProps } = props;

  const { gl, size } = useThree();
  const { width, height } = size;
  const { parentElement } = gl.domElement;

  // Container `div` for ReactDOM to render into, appended next to R3F's `canvas`
  const [el] = useState(() => document.createElement('div'));

  useEffect(() => {
    el.style.cssText = `position: absolute; top: 0; left: 0; z-index: 0;`;

    if (parentElement) {
      parentElement.appendChild(el);
    }

    return () => {
      if (parentElement) {
        parentElement.removeChild(el);
      }

      ReactDOM.unmountComponentAtNode(el);
    };
  }, [el, parentElement]);

  useEffect(() => {
    ReactDOM.render(
      <div
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          ...style,
        }}
        {...divProps}
      >
        {children}
      </div>,
      el
    );
  }, [children, className, el, height, width, style, divProps]);

  return <></>;
}

export default Html;
