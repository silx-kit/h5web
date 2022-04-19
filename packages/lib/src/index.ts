// Visualizations
export { default as MatrixVis } from './vis/matrix/MatrixVis';
export type { MatrixVisProps } from './vis/matrix/MatrixVis';
export { default as LineVis } from './vis/line/LineVis';
export type { LineVisProps } from './vis/line/LineVis';
export { default as HeatmapVis } from './vis/heatmap/HeatmapVis';
export type { HeatmapVisProps } from './vis/heatmap/HeatmapVis';
export { default as ScatterVis } from './vis/scatter/ScatterVis';
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
export { default as InteractionHelp } from './toolbar/controls/InteractionHelp';
export { default as FloatingControl } from './toolbar/floating/FloatingControl';
export { default as ResetZoomButton } from './toolbar/floating/ResetZoomButton';

// Building blocks
export { default as VisCanvas } from './vis/shared/VisCanvas';
export type { VisCanvasProps } from './vis/shared/VisCanvas';
export { default as TooltipMesh } from './vis/shared/TooltipMesh';
export type { TooltipMeshProps } from './vis/shared/TooltipMesh';
export { default as Html } from './vis/shared/Html';
export { default as Overlay } from './vis/shared/Overlay';
export { default as Annotation } from './vis/shared/Annotation';

export { default as DataCurve } from './vis/line/DataCurve';
export type { DataCurveProps } from './vis/line/DataCurve';
export { default as ColorBar } from './vis/heatmap/ColorBar';
export type { ColorBarProps } from './vis/heatmap/ColorBar';
export { default as HeatmapMesh } from './vis/heatmap/HeatmapMesh';
export type { HeatmapMeshProps } from './vis/heatmap/HeatmapMesh';
export { default as TiledHeatmapMesh } from './vis/tiles/TiledHeatmapMesh';
export type { TiledHeatmapMeshProps } from './vis/tiles/TiledHeatmapMesh';
export { getLayerSizes, TilesApi } from './vis/tiles/api';

// Interactions
export { default as Pan } from './interactions/Pan';
export { default as Zoom } from './interactions/Zoom';
export { default as XAxisZoom } from './interactions/XAxisZoom';
export { default as YAxisZoom } from './interactions/YAxisZoom';
export { default as SelectToZoom } from './interactions/SelectToZoom';
export { default as SelectionLine } from './interactions/SelectionLine';
export { default as SelectionRect } from './interactions/SelectionRect';
export { default as SelectionTool } from './interactions/SelectionTool';
export type { SelectionProps } from './interactions/SelectionTool';

// Context
export { useAxisSystemContext } from './vis/shared/AxisSystemProvider';
export type { AxisSystemContextValue } from './vis/shared/AxisSystemProvider';

// Utilities
export {
  getDomain,
  getDomains,
  getCombinedDomain,
  extendDomain,
  getValueToIndexScale,
} from './vis/utils';

export {
  useDomain,
  useDomains,
  useCombinedDomain,
  useVisibleDomains,
  useFrameRendering,
  useValueToIndexScale,
} from './vis/hooks';

export {
  getLinearGradient,
  getVisDomain,
  getSafeDomain,
} from './vis/heatmap/utils';

export { useVisDomain, useSafeDomain } from './vis/heatmap/hooks';

export { scaleGamma } from './vis/scaleGamma';
export { useCanvasEvents } from './interactions/hooks';

// Models
export { INTERPOLATORS } from './vis/heatmap/interpolators';
export { ScaleType } from '@h5web/shared';
export { CurveType } from './vis/line/models';
export { ImageType } from './vis/rgb/models';

export type {
  InteractionInfo,
  ModifierKey,
  Selection,
} from './interactions/models';

export type { Domain, Dims } from '@h5web/shared';

export type {
  DomainErrors,
  CustomDomain,
  Size,
  AxisConfig,
  AxisParams,
} from './vis/models';

export type { D3Interpolator, ColorMap } from './vis/heatmap/models';
export type { ScatterAxisParams } from './vis/scatter/models';

// Mock data and utilities
export {
  mockMetadata,
  mockValues,
  findMockEntity,
  getMockDataArray,
} from '@h5web/shared';

// Undocumented (for @h5web/app)
export { default as SnapshotBtn } from './toolbar/controls/SnapshotBtn';
export { default as ExportMenu } from './toolbar/controls/ExportMenu';
export { default as CellWidthInput } from './toolbar/controls/CellWidthInput';
export { default as RawVis } from './vis/raw/RawVis';
export { default as ScalarVis } from './vis/scalar/ScalarVis';
export { default as RgbVis } from './vis/rgb/RgbVis';
export { default as VisMesh } from './vis/shared/VisMesh';
export { default as ScatterPoints } from './vis/scatter/ScatterPoints';
