import {
  useState,
  useEffect,
  forwardRef,
  HTMLAttributes,
  useLayoutEffect,
} from 'react';
import ReactDOM from 'react-dom';
import { useThree } from 'react-three-fiber';

// Simplified version of `drei`'s `<Html>` component
// https://github.com/pmndrs/drei/blob/v2.2.3/src/Html.tsx
const Html = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { className, style, children, ...divProps } = props;

    const { gl, size } = useThree();
    const { width, height } = size;
    const { parentElement } = gl.domElement;

    // Container `div` for ReactDOM to render into, appended next to R3F's `canvas`
    const [el] = useState(() => document.createElement('div'));

    useEffect(() => {
      el.style.cssText = `position: absolute; top: 0; left: 0; z-index: 0;`;

      if (parentElement) {
        parentElement.append(el);
      }

      return () => {
        if (parentElement) {
          el.remove();
        }

        ReactDOM.unmountComponentAtNode(el);
      };
    }, [el, parentElement]);

    useLayoutEffect(() => {
      ReactDOM.render(
        <div
          ref={ref}
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
    }, [children, className, el, height, width, style, divProps, ref]);

    return null;
  }
);

export default Html;
