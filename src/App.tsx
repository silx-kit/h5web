import React from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

import rawData from './raw-data.json';
import Browser from './browser/Browser';
import Viewer from './Viewer';

function App(): JSX.Element {
  return (
    <div className="app">
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement className="app__browser" flex={0.3} minSize={250}>
          <Browser rawData={rawData} />
        </ReflexElement>

        <ReflexSplitter />

        <ReflexElement>
          <Viewer />
        </ReflexElement>
      </ReflexContainer>
    </div>
  );
}

export default App;
