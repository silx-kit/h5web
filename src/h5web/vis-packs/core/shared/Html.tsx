import {
  useState,
  HTMLAttributes,
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import ReactDOM from 'react-dom';
import { GroupProps, useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { isDefined } from '../../../guards';

const v1 = new Vector3();

interface Props extends HTMLAttributes<HTMLDivElement> {
  groupProps?: GroupProps;
  followCamera?: boolean;
  scaleOnZoom?: boolean;
}

// Customised version of drei's `<Html>` component
// https://github.com/pmndrs/drei/blob/v6.0.3/src/web/Html.tsx
function Html(props: Props) {
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
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const { parentElement } = gl.domElement;

  // Container `div` for ReactDOM to render into, appended next to R3F's `canvas`
  const [el] = useState(() => {
    const elem = document.createElement('div');

    // Take out of flow and let pointer events pass through to canvas
    elem.style.cssText = `position: absolute; top: 0; left: 0; pointer-events: none;`;

    return elem;
  });

  // Inner `div` that is transformed and scaled if `followCamera` and `scaleOnZoom` are enabled
  const innerRef = useRef<HTMLDivElement>(null);

  /* Placeholder R3F group, the position of which is tracked and forwarded to
   * the inner `div` if `followCamera` and `scaleOnZoom` are enabled. */
  const group = useRef<Group>(null!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

  const getGroupPosition = useCallback(() => {
    const groupPos = v1.setFromMatrixPosition(group.current.matrixWorld);
    groupPos.project(camera);

    return [
      groupPos.x * (width / 2) + width / 2,
      -(groupPos.y * (height / 2)) + height / 2,
    ];
  }, [camera, height, width]);

  const getInnerDivTransform = useCallback(() => {
    const position = followCamera ? getGroupPosition() : undefined;

    return [
      position && `translate3d(${position[0]}px, ${position[1]}px, 0)`,
      scaleOnZoom ? `scale(${camera.zoom})` : undefined,
    ]
      .filter(isDefined)
      .join(' ');
  }, [camera, followCamera, getGroupPosition, scaleOnZoom]);

  // Append/remove container `div` next to R3F's `canvas`
  useLayoutEffect(() => {
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

  // Update size and overflow of container `div`
  useLayoutEffect(() => {
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.overflow = followCamera ? 'hidden' : 'visible';
  }, [el, width, height, followCamera]);

  // Render inner `div`
  useEffect(() => {
    group.current.updateMatrixWorld(); // make sure we get the group's most up to date position

    ReactDOM.render(
      <div
        ref={innerRef}
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transformOrigin: 'left top',
          transform: getInnerDivTransform(),
          ...style,
        }}
        {...divProps}
      >
        {children}
      </div>,
      el
    );
  }, [children, className, divProps, el, getInnerDivTransform, style]);

  // Update inner `div` position on every frame
  useFrame(() => {
    if (innerRef.current) {
      innerRef.current.style.transform = getInnerDivTransform();
    }
  });

  return <group ref={group} {...groupProps} />;
}

export default Html;
