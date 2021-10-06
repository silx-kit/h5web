import { HeatmapVis, LineVis, getMockDataArray, getDomain } from '@h5web/lib';

const lineArray = getMockDataArray('/nD_datasets/oneD');
const lineDomain = getDomain(lineArray);

const heatmapArray = getMockDataArray('/nD_datasets/twoD');
const heatmapDomain = getDomain(heatmapArray);

function App() {
  return (
    <>
      <h2>LineVis</h2>
      <LineVis dataArray={lineArray} domain={lineDomain} showGrid />
      <h2>HeatmapVis</h2>
      <HeatmapVis
        dataArray={heatmapArray}
        domain={heatmapDomain}
        layout="fill"
      />
    </>
  );
}

export default App;
