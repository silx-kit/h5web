import { HeatmapVis, getMockDataArray, getDomain } from '@h5web/lib';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const domain = getDomain(dataArray);

function App() {
  return (
    <>
      <HeatmapVis dataArray={dataArray} domain={domain} />
    </>
  );
}

export default App;
