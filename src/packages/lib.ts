// Visualizations
export { default as ScalarVis } from '../h5web/visualizations/ScalarVis';
export { default as LineVis } from '../h5web/visualizations/line/LineVis';
export { default as HeatmapVis } from '../h5web/visualizations/heatmap/HeatmapVis';

// Building blocks
export { default as VisCanvas } from '../h5web/visualizations/shared/VisCanvas';
export { default as PanZoomMesh } from '../h5web/visualizations/shared/PanZoomMesh';
export { default as TooltipMesh } from '../h5web/visualizations/shared/TooltipMesh';
export { default as ColorBar } from '../h5web/visualizations/heatmap/ColorBar';
export { default as HeatmapMesh } from '../h5web/visualizations/heatmap/Mesh';
export { default as DataCurve } from '../h5web/visualizations/line/DataCurve';
export { default as ErrorBarCurve } from '../h5web/visualizations/line/ErrorBarCurve';

// Utilities
export {
  computeVisSize,
  getDomain,
  extendDomain,
} from '../h5web/visualizations/shared/utils';

export { useDomain } from '../h5web/visualizations/shared/hooks';

export {
  getDims,
  generateCSSLinearGradient,
} from '../h5web/visualizations/heatmap/utils';

// Models
export { ScaleType } from '../h5web/visualizations/shared/models';
export { CurveType } from '../h5web/visualizations/line/models';

export type {
  Domain,
  Size,
  AxisConfig,
} from '../h5web/visualizations/shared/models';

export type {
  Dims,
  D3Interpolator,
  ColorMap,
} from '../h5web/visualizations/heatmap/models';

// Mock data
export { mockMetadata, mockValues } from '../h5web/providers/mock/data';
export { getMockDatasetDims } from '../h5web/providers/mock/utils';
