// Visualizations
export { default as MatrixVis } from '../h5web/vis-packs/core/matrix/MatrixVis';
export { default as LineVis } from '../h5web/vis-packs/core/line/LineVis';
export { default as HeatmapVis } from '../h5web/vis-packs/core/heatmap/HeatmapVis';
export type { MatrixVisProps } from '../h5web/vis-packs/core/matrix/MatrixVis';
export type { LineVisProps } from '../h5web/vis-packs/core/line/LineVis';
export type { HeatmapVisProps } from '../h5web/vis-packs/core/heatmap/HeatmapVis';

// Toolbar and controls
export { default as Toolbar } from '../h5web/toolbar/Toolbar';
export { default as Separator } from '../h5web/toolbar/Separator';
export { default as Btn } from '../h5web/toolbar/controls/Btn';
export { default as DownloadBtn } from '../h5web/toolbar/controls/DownloadBtn';
export { default as ToggleBtn } from '../h5web/toolbar/controls/ToggleBtn';
export { default as ToggleGroup } from '../h5web/toolbar/controls/ToggleGroup';
export { default as DomainSlider } from '../h5web/toolbar/controls/DomainSlider/DomainSlider';
export { default as ColorMapSelector } from '../h5web/toolbar/controls/ColorMapSelector/ColorMapSelector';
export { default as ScaleSelector } from '../h5web/toolbar/controls/ScaleSelector/ScaleSelector';
export { default as GridToggler } from '../h5web/toolbar/controls/GridToggler';
export { default as FlipYAxisToggler } from '../h5web/toolbar/controls/FlipYAxisToggler';

// Building blocks
export { default as VisCanvas } from '../h5web/vis-packs/core/shared/VisCanvas';
export { default as PanZoomMesh } from '../h5web/vis-packs/core/shared/PanZoomMesh';
export { default as TooltipMesh } from '../h5web/vis-packs/core/shared/TooltipMesh';
export { default as VisMesh } from '../h5web/vis-packs/core/shared/VisMesh';
export { default as ColorBar } from '../h5web/vis-packs/core/heatmap/ColorBar';
export { default as HeatmapMesh } from '../h5web/vis-packs/core/heatmap/HeatmapMesh';
export { default as DataCurve } from '../h5web/vis-packs/core/line/DataCurve';
export { default as Html } from '../h5web/vis-packs/core/shared/Html';
export { default as Annotation } from '../h5web/vis-packs/core/shared/Annotation';

// Context hook
export { useAxisSystemContext } from '../h5web/vis-packs/core/shared/AxisSystemContext';
export type { AxisSystemParams } from '../h5web/vis-packs/core/shared/AxisSystemContext';

// Utilities
export {
  computeCanvasSize,
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

export {
  getLinearGradient,
  getVisDomain,
  getSafeDomain,
} from '../h5web/vis-packs/core/heatmap/utils';

export {
  useVisDomain,
  useSafeDomain,
} from '../h5web/vis-packs/core/heatmap/hooks';

export { scaleGamma } from '../h5web/vis-packs/core/scaleGamma';

// Models
export { INTERPOLATORS } from '../h5web/vis-packs/core/heatmap/interpolators';
export { ScaleType } from '../h5web/vis-packs/core/models';
export { CurveType } from '../h5web/vis-packs/core/line/models';

export type {
  Domain,
  DomainErrors,
  CustomDomain,
  Size,
  AxisConfig,
} from '../h5web/vis-packs/core/models';

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
