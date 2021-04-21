// Visualizations
export { default as ScalarVis } from '../h5web/vis-packs/core/scalar/ScalarVis';
export { default as LineVis } from '../h5web/vis-packs/core/line/LineVis';
export { default as HeatmapVis } from '../h5web/vis-packs/core/heatmap/HeatmapVis';
export type { ScalarVisProps } from '../h5web/vis-packs/core/scalar/ScalarVis';
export type { LineVisProps } from '../h5web/vis-packs/core/line/LineVis';
export type { HeatmapVisProps } from '../h5web/vis-packs/core/heatmap/HeatmapVis';

// Building blocks
export { default as VisCanvas } from '../h5web/vis-packs/core/shared/VisCanvas';
export { default as PanZoomMesh } from '../h5web/vis-packs/core/shared/PanZoomMesh';
export { default as TooltipMesh } from '../h5web/vis-packs/core/shared/TooltipMesh';
export { default as ColorBar } from '../h5web/vis-packs/core/heatmap/ColorBar';
export { default as HeatmapMesh } from '../h5web/vis-packs/core/heatmap/Mesh';
export { default as DataCurve } from '../h5web/vis-packs/core/line/DataCurve';
export type { VisCanvasProps } from '../h5web/vis-packs/core/shared/VisCanvas';

// Utilities
export {
  computeVisSize,
  getDomain,
  getDomains,
  getCombinedDomain,
  extendDomain,
} from '../h5web/vis-packs/core/utils';

export {
  useDomain,
  useDomains,
  useCombinedDomain,
} from '../h5web/vis-packs/core/hooks';

export { getLinearGradient } from '../h5web/vis-packs/core/heatmap/utils';

// Models
export { INTERPOLATORS } from '../h5web/vis-packs/core/heatmap/interpolators';
export { ScaleType } from '../h5web/vis-packs/core/models';
export { CurveType } from '../h5web/vis-packs/core/line/models';

export type { Domain, Size, AxisConfig } from '../h5web/vis-packs/core/models';

export type {
  Dims,
  D3Interpolator,
  ColorMap,
} from '../h5web/vis-packs/core/heatmap/models';

// Mock data
export { mockMetadata } from '../h5web/providers/mock/metadata';
export { mockValues } from '../h5web/providers/mock/values';

export {
  findMockEntity,
  getMockDataArray,
} from '../h5web/providers/mock/utils';
