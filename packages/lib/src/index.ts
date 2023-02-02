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
export { default as ColorMapSelector } from './toolbar/controls/ColorMapSelector/ColorMapSelector';
export { default as ScaleSelector } from './toolbar/controls/ScaleSelector/ScaleSelector';
export { default as GridToggler } from './toolbar/controls/GridToggler';
export { default as FlipYAxisToggler } from './toolbar/controls/FlipYAxisToggler';
export { default as Selector } from './toolbar/controls/Selector/Selector';
export { default as InteractionHelp } from './toolbar/controls/InteractionHelp';
export { default as FloatingControl } from './toolbar/floating/FloatingControl';
export { default as ResetZoomButton } from './toolbar/floating/ResetZoomButton';
export { default as NotationToggleGroup } from './toolbar/controls/NotationToggleGroup';
export { default as Histogram } from './toolbar/controls/Histogram/Histogram';
export type { DomainSliderProps } from './toolbar/controls/DomainSlider/DomainSlider';
export type { HistogramProps } from './toolbar/controls/Histogram/Histogram';

// Building blocks
export { default as VisCanvas } from './vis/shared/VisCanvas';
export { default as TooltipMesh } from './vis/shared/TooltipMesh';
export { default as Html } from './vis/shared/Html';
export { default as Overlay } from './vis/shared/Overlay';
export { default as Annotation } from './vis/shared/Annotation';
export { default as DataToHtml } from './vis/shared/DataToHtml';
export type { VisCanvasProps } from './vis/shared/VisCanvas';
export type { TooltipMeshProps } from './vis/shared/TooltipMesh';
export type { DataToHtmlProps } from './vis/shared/DataToHtml';

export { default as DataCurve } from './vis/line/DataCurve';
export { default as ColorBar } from './vis/heatmap/ColorBar';
export { default as HeatmapMesh } from './vis/heatmap/HeatmapMesh';
export type { DataCurveProps } from './vis/line/DataCurve';
export type { ColorBarProps } from './vis/heatmap/ColorBar';
export type { HeatmapMeshProps } from './vis/heatmap/HeatmapMesh';

// Interactions
export { default as DefaultInteractions } from './interactions/DefaultInteractions';
export { default as Pan } from './interactions/Pan';
export { default as Zoom } from './interactions/Zoom';
export { default as XAxisZoom } from './interactions/XAxisZoom';
export { default as YAxisZoom } from './interactions/YAxisZoom';
export { default as SelectToZoom } from './interactions/SelectToZoom';
export { default as AxialSelectToZoom } from './interactions/AxialSelectToZoom';
export { default as SelectionTool } from './interactions/SelectionTool';
export { default as AxialSelectionTool } from './interactions/AxialSelectionTool';
export type { PanProps } from './interactions/Pan';
export type { ZoomProps } from './interactions/Zoom';
export type { XAxisZoomProps } from './interactions/XAxisZoom';
export type { YAxisZoomProps } from './interactions/YAxisZoom';
export type { SelectionToolProps } from './interactions/SelectionTool';
export type { SelectToZoomProps } from './interactions/SelectToZoom';
export type { AxialSelectionToolProps } from './interactions/AxialSelectionTool';
export type { AxialSelectToZoomProps } from './interactions/AxialSelectToZoom';
export type { DefaultInteractionsConfig } from './interactions/DefaultInteractions';

// SVG
export { default as SvgElement } from './interactions/svg/SvgElement';
export { default as SvgLine } from './interactions/svg/SvgLine';
export { default as SvgRect } from './interactions/svg/SvgRect';
export type { SvgElementProps } from './interactions/svg/SvgElement';
export type { SvgLineProps } from './interactions/svg/SvgLine';
export type { SvgRectProps } from './interactions/svg/SvgRect';

// Context
export { useVisCanvasContext } from './vis/shared/VisCanvasProvider';
export type { VisCanvasContextValue } from './vis/shared/VisCanvasProvider';

// Utilities
export {
  getDomain,
  getDomains,
  getCombinedDomain,
  extendDomain,
  getAxisValues,
  getAxisDomain,
  getValueToIndexScale,
} from './vis/utils';

export {
  useDomain,
  useDomains,
  useCombinedDomain,
  useAxisValues,
  useAxisDomain,
  useValueToIndexScale,
  useCameraState,
  useHtmlCoords,
} from './vis/hooks';

export {
  getLinearGradient,
  getVisDomain,
  getSafeDomain,
} from './vis/heatmap/utils';

export { useVisDomain, useSafeDomain } from './vis/heatmap/hooks';

export { scaleGamma } from './vis/scaleGamma';
export { useCanvasEvents } from './interactions/hooks';
export { default as Box } from './interactions/box';

// Models
export { INTERPOLATORS } from './vis/heatmap/interpolators';
export { ScaleType } from '@h5web/shared';
export { CurveType, GlyphType } from './vis/line/models';
export { ImageType } from './vis/rgb/models';
export { Notation } from './vis/matrix/models';

export type {
  InteractionInfo,
  ModifierKey,
  Selection,
  Rect,
  CanvasEvent,
  CanvasEventCallbacks,
} from './interactions/models';
export { MouseButton } from './interactions/models';

export type { Domain, VisibleDomains, Dims, Axis } from '@h5web/shared';

export type {
  Aspect,
  DomainErrors,
  CustomDomain,
  Size,
  AxisConfig,
  AxisParams,
  VisScaleType,
  HistogramParams,
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

// Undocumented and/or experimental
export { default as SnapshotBtn } from './toolbar/controls/SnapshotBtn';
export { default as ExportMenu } from './toolbar/controls/ExportMenu';
export { default as CellWidthInput } from './toolbar/controls/CellWidthInput';
export { default as RawVis } from './vis/raw/RawVis';
export { default as ScalarVis } from './vis/scalar/ScalarVis';
export { default as RgbVis } from './vis/rgb/RgbVis';
export { default as VisMesh } from './vis/shared/VisMesh';
export { default as ScatterPoints } from './vis/scatter/ScatterPoints';
export { default as TiledHeatmapMesh } from './vis/tiles/TiledHeatmapMesh';
export { default as TiledTooltipMesh } from './vis/tiles/TiledTooltipMesh';
export { getLayerSizes, TilesApi } from './vis/tiles/api';
export { useValidDomainForScale } from './vis/hooks';
export { assertLength, assertDefined } from '@h5web/shared';
export type { TiledHeatmapMeshProps } from './vis/tiles/TiledHeatmapMesh';
export { default as SurfaceVis } from './vis/surface/SurfaceVis';
export type { SurfaceVisProps } from './vis/surface/SurfaceVis';
export { default as R3FCanvas } from './vis/shared/R3FCanvas';
