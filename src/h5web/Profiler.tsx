import React, { Profiler as ReactProfiler, ReactElement } from 'react';

interface Props {
  id: string;
  children: ReactElement;
}

function Profiler(props: Props): ReactElement {
  const { id, children } = props;

  if (process.env.REACT_APP_PROFILING_ENABLED !== 'true') {
    return children;
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
