// Visualizations
export { default as MatrixVis } from './vis/matrix/MatrixVis';
export { default as LineVis } from './vis/line/LineVis';
export { default as HeatmapVis } from './vis/heatmap/HeatmapVis';
export { default as ScatterVis } from './vis/scatter/ScatterVis';
export type { MatrixVisProps } from './vis/matrix/MatrixVis';
export type { LineVisProps } from './vis/line/LineVis';
export type { HeatmapVisProps } from './vis/heatmap/HeatmapVis';
export type { ScatterVisProps } from './vis/scatter/ScatterVis';

// Toolbar and controls
export { default as Toolbar } from './toolbar/Toolbar';
export { default as Separator } from './toolbar/Separator';
export { default as Btn } from './toolbar/controls/Btn';
export { default as LinkBtn } from './toolbar/controls/LinkBtn';
export { default as ToggleBtn } from './toolbar/controls/ToggleBtn';
export { default as ToggleGroup } from './toolbar/controls/ToggleGroup';
export { default as DomainSlider } from './toolbar/controls/DomainSlider/DomainSlider';
export type { DomainSliderProps } from './toolbar/controls/DomainSlider/DomainSlider';
export { default as ColorMapSelector } from './toolbar/controls/ColorMapSelector/ColorMapSelector';
export { default as ScaleSelector } from './toolbar/controls/ScaleSelector/ScaleSelector';
export { default as GridToggler } from './toolbar/controls/GridToggler';
export { default as FlipYAxisToggler } from './toolbar/controls/FlipYAxisToggler';
export { default as Selector } from './toolbar/controls/Selector/Selector';
export { default as ExportMenu } from './toolbar/controls/ExportMenu';

// Building blocks
export { default as VisCanvas } from './vis/shared/VisCanvas';
export type { VisCanvasProps } from './vis/shared/VisCanvas';
export { default as PanZoomMesh } from './vis/shared/PanZoomMesh';
export { default as TooltipMesh } from './vis/shared/TooltipMesh';
export type { TooltipMeshProps } from './vis/shared/TooltipMesh';
export { default as VisMesh } from './vis/shared/VisMesh';
export { default as ColorBar } from './vis/heatmap/ColorBar';
export type { ColorBarProps } from './vis/heatmap/ColorBar';
export { default as HeatmapMesh } from './vis/heatmap/HeatmapMesh';
export { default as DataCurve } from './vis/line/DataCurve';
export { default as Html } from './vis/shared/Html';
export { default as Annotation } from './vis/shared/Annotation';
export { default as LineSelectionMesh } from './vis/shared/LineSelectionMesh';
export { default as RectSelectionMesh } from './vis/shared/RectSelectionMesh';

// Context hook
export { useAxisSystemContext } from './vis/shared/AxisSystemContext';
export type { AxisSystemParams } from './vis/shared/AxisSystemContext';

// Utilities
export {
  getDomain,
  getDomains,
  getCombinedDomain,
  extendDomain,
} from './vis/utils';

export {
  useDomain,
  useDomains,
  useCombinedDomain,
  useVisibleDomains,
  useFrameRendering,
} from './vis/hooks';

export {
  getLinearGradient,
  getVisDomain,
  getSafeDomain,
} from './vis/heatmap/utils';

export { useVisDomain, useSafeDomain } from './vis/heatmap/hooks';

export { scaleGamma } from './vis/scaleGamma';

// Models
export { INTERPOLATORS } from './vis/heatmap/interpolators';
export { ScaleType } from '@h5web/shared';
export { CurveType } from './vis/line/models';

export type { Domain } from '@h5web/shared';

export type {
  DomainErrors,
  CustomDomain,
  Size,
  AxisConfig,
  AxisParams,
} from './vis/models';

export type { Dims, D3Interpolator, ColorMap } from './vis/heatmap/models';

// Mock data and utilities
export {
  mockMetadata,
  mockValues,
  findMockEntity,
  getMockDataArray,
} from '@h5web/shared';

// Undocumented (for @h5web/app)
export { default as SnapshotBtn } from './toolbar/controls/SnapshotBtn';
export { default as RawVis } from './vis/raw/RawVis';
export { default as ScalarVis } from './vis/scalar/ScalarVis';
export { default as RgbVis } from './vis/rgb/RgbVis';
export { ImageType } from './vis/rgb/models';
