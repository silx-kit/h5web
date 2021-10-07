import './styles.css';

// Visualizations
export { default as MatrixVis } from './vis-packs/core/matrix/MatrixVis';
export { default as LineVis } from './vis-packs/core/line/LineVis';
export { default as HeatmapVis } from './vis-packs/core/heatmap/HeatmapVis';
export type { MatrixVisProps } from './vis-packs/core/matrix/MatrixVis';
export type { LineVisProps } from './vis-packs/core/line/LineVis';
export type { HeatmapVisProps } from './vis-packs/core/heatmap/HeatmapVis';

// Toolbar and controls
export { default as Toolbar } from './toolbar/Toolbar';
export { default as Separator } from './toolbar/Separator';
export { default as Btn } from './toolbar/controls/Btn';
export { default as DownloadBtn } from './toolbar/controls/DownloadBtn';
export { default as ToggleBtn } from './toolbar/controls/ToggleBtn';
export { default as ToggleGroup } from './toolbar/controls/ToggleGroup';
export { default as DomainSlider } from './toolbar/controls/DomainSlider/DomainSlider';
export type { DomainSliderProps } from './toolbar/controls/DomainSlider/DomainSlider';
export { default as ColorMapSelector } from './toolbar/controls/ColorMapSelector/ColorMapSelector';
export { default as ScaleSelector } from './toolbar/controls/ScaleSelector/ScaleSelector';
export { default as GridToggler } from './toolbar/controls/GridToggler';
export { default as FlipYAxisToggler } from './toolbar/controls/FlipYAxisToggler';
export { default as Selector } from './toolbar/controls/Selector/Selector';

// Building blocks
export { default as VisCanvas } from './vis-packs/core/shared/VisCanvas';
export type { VisCanvasProps } from './vis-packs/core/shared/VisCanvas';
export { default as PanZoomMesh } from './vis-packs/core/shared/PanZoomMesh';
export { default as TooltipMesh } from './vis-packs/core/shared/TooltipMesh';
export type { TooltipMeshProps } from './vis-packs/core/shared/TooltipMesh';
export { default as VisMesh } from './vis-packs/core/shared/VisMesh';
export { default as ColorBar } from './vis-packs/core/heatmap/ColorBar';
export type { ColorBarProps } from './vis-packs/core/heatmap/ColorBar';
export { default as HeatmapMesh } from './vis-packs/core/heatmap/HeatmapMesh';
export { default as DataCurve } from './vis-packs/core/line/DataCurve';
export { default as Html } from './vis-packs/core/shared/Html';
export { default as Annotation } from './vis-packs/core/shared/Annotation';

// Context hook
export { useAxisSystemContext } from './vis-packs/core/shared/AxisSystemContext';
export type { AxisSystemParams } from './vis-packs/core/shared/AxisSystemContext';

// Utilities
export {
  computeCanvasSize,
  getDomain,
  getDomains,
  getCombinedDomain,
  extendDomain,
} from './vis-packs/core/utils';

export {
  useDomain,
  useDomains,
  useCombinedDomain,
} from './vis-packs/core/hooks';

export {
  getLinearGradient,
  getVisDomain,
  getSafeDomain,
} from './vis-packs/core/heatmap/utils';

export { useVisDomain, useSafeDomain } from './vis-packs/core/heatmap/hooks';

export { scaleGamma } from './vis-packs/core/scaleGamma';

// Models
export { INTERPOLATORS } from './vis-packs/core/heatmap/interpolators';
export { ScaleType } from '@h5web/shared';
export { CurveType } from './vis-packs/core/line/models';

export type { Domain } from '@h5web/shared';

export type {
  DomainErrors,
  CustomDomain,
  Size,
  AxisConfig,
  AxisParams,
} from './vis-packs/core/models';

export type {
  Dims,
  D3Interpolator,
  ColorMap,
} from './vis-packs/core/heatmap/models';

// Mock data and utilities
export {
  mockMetadata,
  mockValues,
  findMockEntity,
  getMockDataArray,
} from '@h5web/shared';

// Undocumented (for @h5web/app)
export { default as SnapshotButton } from './toolbar/controls/SnapshotButton';
export { default as RawVis } from './vis-packs/core/raw/RawVis';
export { default as ScalarVis } from './vis-packs/core/scalar/ScalarVis';
export { default as RgbVis } from './vis-packs/core/rgb/RgbVis';
export { ImageType } from './vis-packs/core/rgb/models';
