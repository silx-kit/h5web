import { Profiler as ReactProfiler, ReactNode } from 'react';

interface Props {
  id: string;
  children: ReactNode;
}

function Profiler(props: Props) {
  const { id, children } = props;

  if (process.env.REACT_APP_PROFILING_ENABLED !== 'true') {
    return <>{children}</>; // eslint-disable-line react/jsx-no-useless-fragment
  }

  return (
    <ReactProfiler
      id={id}
      onRender={(_, phase, actualDuration, baseDuration) => {
        // eslint-disable-next-line no-console
        console.debug(
          id,
          phase,
          '- duration =',
          actualDuration,
          '- worst-case =',
          baseDuration
        );
      }}
    >
      {children}
    </ReactProfiler>
  );
}

export default Profiler;
