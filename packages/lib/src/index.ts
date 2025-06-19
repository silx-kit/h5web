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
export { default as ToggleGroup } from './toolbar/controls/ToggleGroup/ToggleGroup';
export { default as DomainWidget } from './toolbar/controls/DomainWidget/DomainWidget';
export { default as DomainSlider } from './toolbar/controls/DomainWidget/DomainSlider';
export { default as DomainControls } from './toolbar/controls/DomainWidget/DomainControls';
export { default as ColorMapGradient } from './toolbar/controls/ColorMapSelector/ColorMapGradient';
export { default as ColorMapSelector } from './toolbar/controls/ColorMapSelector/ColorMapSelector';
export { default as ScaleSelector } from './toolbar/controls/ScaleSelector/ScaleSelector';
export { default as ComplexVisTypeSelector } from './toolbar/controls/ComplexVisTypeSelector';
export { default as Selector } from './toolbar/controls/Selector/Selector';
export { default as InteractionHelp } from './toolbar/controls/InteractionHelp';
export { default as FloatingControl } from './toolbar/floating/FloatingControl';
export { default as ResetZoomButton } from './toolbar/floating/ResetZoomButton';
export { default as NotationToggleGroup } from './toolbar/controls/NotationToggleGroup';
export { default as Histogram } from './toolbar/controls/Histogram/Histogram';
export type { ToolbarProps } from './toolbar/Toolbar';
export type { DomainWidgetProps } from './toolbar/controls/DomainWidget/DomainWidget';
export type { DomainSliderProps } from './toolbar/controls/DomainWidget/DomainSlider';
export type { DomainControlsHandle } from './toolbar/controls/DomainWidget/DomainControls';
export type { DomainControlsProps } from './toolbar/controls/DomainWidget/DomainControls';
export type { HistogramProps } from './toolbar/controls/Histogram/Histogram';

// Dimension mapper
export { default as DimensionMapper } from './dimension-mapper/DimensionMapper';
export { initDimMapping, getSliceSelection } from './dimension-mapper/utils';
export { useSlicedDimsAndMapping } from './dimension-mapper/hooks';
export { type DimensionMapping } from './dimension-mapper/models';
export { type AxisMapping } from '@h5web/shared/nexus-models';

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
export { default as Line } from './vis/line/Line';
export { default as Glyphs } from './vis/line/Glyphs';
export { default as ErrorBars } from './vis/line/ErrorBars';
export { default as ColorBar } from './vis/heatmap/ColorBar';
export { default as HeatmapMesh } from './vis/heatmap/HeatmapMesh';
export type { DataCurveProps } from './vis/line/DataCurve';
export type { LineProps } from './vis/line/Line';
export type { GlyphsProps } from './vis/line/Glyphs';
export type { ErrorBarsProps } from './vis/line/ErrorBars';
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
export { default as SvgCircle } from './interactions/svg/SvgCircle';
export type { SvgElementProps } from './interactions/svg/SvgElement';
export type { SvgLineProps } from './interactions/svg/SvgLine';
export type { SvgRectProps } from './interactions/svg/SvgRect';
export type { SvgCircleProps } from './interactions/svg/SvgCircle';

// Context
export { useVisCanvasContext } from './vis/shared/VisCanvasProvider';
export type { VisCanvasContextValue } from './vis/shared/VisCanvasProvider';

// Utilities
export { toTypedNdArray } from '@h5web/shared/vis-utils';

export {
  getDomain,
  getDomains,
  getCombinedDomain,
  extendDomain,
  getAxisDomain,
  getValueToIndexScale,
  createBufferAttr,
  createIndex,
} from './vis/utils';

export {
  useDomain,
  useDomains,
  useCombinedDomain,
  useAxisDomain,
  useValueToIndexScale,
  useCameraState,
  useGeometry,
} from './vis/hooks';

export { getAxisValues } from './vis/line/utils';
export { useAxisValues } from './vis/line/hooks';

export {
  getLinearGradient,
  getVisDomain,
  getSafeDomain,
} from './vis/heatmap/utils';

export { useVisDomain, useSafeDomain } from './vis/heatmap/hooks';

export { scaleGamma } from './vis/scaleGamma';

export {
  useCanvasEvent,
  useInteraction,
  useModifierKeyPressed,
  useDrag,
} from './interactions/hooks';
export { default as Box } from './interactions/box';

// Geometries
export { default as H5WebGeometry } from './vis/shared/h5webGeometry';
export { default as LineGeometry } from './vis/line/lineGeometry';
export { default as GlyphsGeometry } from './vis/line/glyphsGeometry';
export { default as ErrorBarsGeometry } from './vis/line/errorBarsGeometry';
export { default as ErrorCapsGeometry } from './vis/line/errorCapsGeometry';

// Constants
export { COLOR_SCALE_TYPES, AXIS_SCALE_TYPES } from '@h5web/shared/vis-utils';
export { Z_MIN, Z_MAX } from './vis/utils';
export { INTERPOLATORS } from './vis/heatmap/interpolators';

// Enums
export { ScaleType, ComplexVisType } from '@h5web/shared/vis-models';
export { CurveType, GlyphType } from './vis/line/models';
export { ImageType } from './vis/rgb/models';
export { Notation } from './vis/matrix/models';
export { MouseButton } from './interactions/models';

// Models
export type {
  Domain,
  VisibleDomains,
  Dims,
  Axis,
  ColorScaleType,
  AxisScaleType,
  IgnoreValue,
  ExportEntry,
  ExportURL,
  ExportFormat,
  BuiltInExporter,
} from '@h5web/shared/vis-models';

export type {
  Aspect,
  DomainErrors,
  CustomDomain,
  Size,
  AxisConfig,
  AxisParams,
  VisScaleType,
  ExtractScaleType,
  ScaleConfig,
  ScaleGammaConfig,
  Scale,
  AxisScale,
  HistogramParams,
} from './vis/models';

export type { AuxiliaryParams } from './vis/line/models';
export type { D3Interpolator, ColorMap } from './vis/heatmap/models';
export type { ScatterAxisParams } from './vis/scatter/models';

export type {
  ModifierKey,
  Rect,
  Selection,
  CanvasEvent,
  InteractionInfo,
  InteractionConfig,
  CommonInteractionProps,
} from './interactions/models';

// Mock data and utilities
export { mockValues } from '@h5web/shared/mock-values';

// Undocumented and/or experimental
export { default as SnapshotBtn } from './toolbar/controls/SnapshotBtn';
export { default as ExportMenu } from './toolbar/controls/ExportMenu';
export { default as CellWidthInput } from './toolbar/controls/CellWidthInput';
export { default as RawVis } from './vis/raw/RawVis';
export { default as RawImageVis } from './vis/raw/RawImageVis';
export { default as ScalarVis } from './vis/scalar/ScalarVis';
export { default as RgbVis } from './vis/rgb/RgbVis';
export { default as VisMesh } from './vis/shared/VisMesh';
export { default as ScatterPoints } from './vis/scatter/ScatterPoints';
export { default as ScatterPointsGeometry } from './vis/scatter/scatterPointsGeometry';
export { default as TiledHeatmapMesh } from './vis/tiles/TiledHeatmapMesh';
export { default as TiledTooltipMesh } from './vis/tiles/TiledTooltipMesh';
export { getLayerSizes, TilesApi } from './vis/tiles/api';
export { useValidDomainForScale } from './vis/hooks';
export {
  assertLength,
  assertDefined,
  assertNonNull,
} from '@h5web/shared/guards';
export type { TiledHeatmapMeshProps } from './vis/tiles/TiledHeatmapMesh';
export { default as SurfaceVis } from './vis/surface/SurfaceVis';
export type { SurfaceVisProps } from './vis/surface/SurfaceVis';
export { default as SurfaceMeshGeometry } from './vis/surface/surfaceMeshGeometry';
export { default as R3FCanvas } from './vis/shared/R3FCanvas';
