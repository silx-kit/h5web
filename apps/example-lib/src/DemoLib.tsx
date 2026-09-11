import { getDomain, HeatmapVis, LineVis, mockValues } from '@h5web/lib';

const lineArray = mockValues.oneD();
const lineDomain = getDomain(lineArray);

const heatmapArray = mockValues.twoD();
const heatmapDomain = getDomain(heatmapArray);

function DemoLib() {
  return (
    <>
      <h2>
        <code>LineVis</code>
      </h2>
      <LineVis dataArray={lineArray} domain={lineDomain} showGrid />

      <h2>
        <code>HeatmapVis</code>
      </h2>
      <HeatmapVis
        dataArray={heatmapArray}
        domain={heatmapDomain}
        aspect="auto"
      />
    </>
  );
}

export default DemoLib;
