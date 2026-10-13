import { type PropsWithChildren, useEffect, useRef } from 'react';

interface Props {
  className: string;
  inert: boolean;
}

// `inert` is not supported as a JSX prop in React 18, so set the attribute manually
function InertBox(props: PropsWithChildren<Props>) {
  const { className, inert, children } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.toggleAttribute('inert', inert);
  }, [inert]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default InertBox;
