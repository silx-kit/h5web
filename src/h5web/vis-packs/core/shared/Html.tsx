import {
  useState,
  forwardRef,
  HTMLAttributes,
  useLayoutEffect,
  useRef,
} from 'react';
import ReactDOM from 'react-dom';
import { GroupProps, useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

// Simplified version of `drei`'s `<Html>` component
// https://github.com/pmndrs/drei/blob/v6.0.3/src/web/Html.tsx

const v1 = new Vector3();

interface HtmlProps extends HTMLAttributes<HTMLDivElement> {
  groupProps?: GroupProps;
  followCamera?: boolean;
  scaleOnZoom?: boolean;
}

const Html = forwardRef<HTMLDivElement, HtmlProps>((props, ref) => {
  const {
    className,
    style,
    children,
    followCamera,
    scaleOnZoom,
    groupProps = {},
    ...divProps
  } = props;

  const { width, height } = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const { parentElement } = gl.domElement;
  const camera = useThree((state) => state.camera);

  // Container `div` for ReactDOM to render into, appended next to R3F's `canvas`
  const [el] = useState(() => document.createElement('div'));
  // Placeholder R3F group, the position of which is tracked and forwarded to `el` when `followCamera` is enabled
  const group = useRef<Group>(null!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

  function updateHtmlPosition() {
    const objectPos = v1.setFromMatrixPosition(group.current.matrixWorld);
    objectPos.project(camera);
    const widthHalf = width / 2;
    const heightHalf = height / 2;
    const pos = [
      objectPos.x * widthHalf + widthHalf,
      -(objectPos.y * heightHalf) + heightHalf,
    ];

    el.style.transform = `translate3d(${pos[0]}px,${pos[1]}px,0)
    scale(${scaleOnZoom ? camera.zoom : 1})`;
  }

  useLayoutEffect(() => {
    group.current.updateMatrixWorld(); // To place correctly `el` on first render
    el.style.cssText = `position:absolute; top:0; left:0; transform-origin:0 0;`;
    if (followCamera) {
      updateHtmlPosition();
    }

    if (parentElement) {
      parentElement.append(el);
    }

    return () => {
      if (parentElement) {
        el.remove();
      }
      ReactDOM.unmountComponentAtNode(el);
    };
  }, [el, parentElement]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    ReactDOM.render(
      <div
        ref={ref}
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none', // let pointer events pass through to canvas
          ...style,
        }}
        {...divProps}
      >
        {children}
      </div>,
      el
    );
  }, [children, className, el, style, ref, divProps]);

  useFrame(() => {
    if (followCamera) {
      updateHtmlPosition();
    }
  });

  return <group ref={group} {...groupProps} />;
});

export default Html;
