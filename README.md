# H5Web: React components for data visualization and exploration

[![Demos](https://img.shields.io/website?down_message=offline&label=demo&up_message=online&url=https%3A%2F%2Fh5web.panosc.eu%2F)](https://h5web.panosc.eu/)

H5Web is a collection of React components to visualize and explore data. It
consists of three packages:

- **@h5web/lib**: visualization components built with
  [react-three-fiber](https://github.com/react-spring/react-three-fiber).
- **@h5web/app**: a component to explore and visualize data stored in HDF5 (or
  HDF5-like) files, and data providers to connect this component to various
  back-end solutions.
- **@h5web/h5wasm**: an additional data provider that can read HDF5 files
  straight in the browser.

> While H5Web was initially built with the HDF5 format in mind, `@h5web/lib`
> visualization components are not tied to HDF5 and can be used to visualize
> data from any source. Also, `@h5web/app` lets you write your own data provider
> and can therefore work with any other hierarchical data format.

If you're after a ready-made solution to view local HDF5 files, take a look at
the JupyterLab extension
[jupyterlab-h5web](https://github.com/silx-kit/jupyterlab-h5web). The extension
is based on `@h5web/app` and the [h5grove](https://github.com/silx-kit/h5grove/)
Python package.

![H5Web GIF demo](https://user-images.githubusercontent.com/2936402/107791492-4c512980-6d54-11eb-8ba4-4a1433bdfeea.gif)

## NPM packages 📚

### [@h5web/lib](https://www.npmjs.com/package/@h5web/lib)

H5Web's component library, which includes the main visualization components
(`LineVis`, `HeatmapVis`, etc.) as well as some of their lower-level building
blocks (`VisCanvas`, `ColorBar`, etc.)

The library is documented in a Storybook site accessible at
https://h5web-docs.panosc.eu.

Some examples of usage of `@h5web/lib`:

| LineVis with multiple curves                                                                                                                     | HeatmapVis with horizontal color bar and tooltip                                                                                                                          | Comparison between gamma and power scale                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![LineVis with multiple curves](https://screenshots.codesandbox.io/kwkli/99.png)](https://codesandbox.io/s/h5weblib-demo-multiple-curves-kwkli) | [![HeatmapVis with horizontal color bar and tooltip](https://screenshots.codesandbox.io/ti5cy/75.png)](https://codesandbox.io/s/h5weblib-demo-heatmap-with-tooltip-ti5cy) | [![Comparison between gamma and power scale](https://screenshots.codesandbox.io/lzmvr/85.png)](https://codesandbox.io/s/gamma-vs-power-scale-lzmvr) |

### [@h5web/app](https://www.npmjs.com/package/@h5web/app)

HDF5 viewer component (`App`) and built-in data providers.

Data providers are components that fetch data from HDF5 back-end solutions and
provide this data to the app through React Context. H5Web currently includes
three providers, two of which are available in the `@h5web/app` package:

- `H5GroveProvider` for server implementations based on
  [H5Grove](https://github.com/silx-kit/h5grove), like
  [jupyterlab-h5web](https://github.com/silx-kit/jupyterlab-h5web)
- `HsdsProvider` for [HSDS](https://github.com/HDFGroup/hsds)

### [@h5web/h5wasm](https://www.npmjs.com/package/@h5web/h5wasm)

This package includes a third data provider, `H5WasmProvider`, that can read
HDF5 files straight in the browser thanks to the
[h5wasm](https://github.com/usnistgov/h5wasm) library.

## Demos

The stand-alone demo app demonstrates the use of the built-in data providers and
visualizations. Several demos are available, one per data provider:

### [H5Grove](https://github.com/silx-kit/h5grove)

This demo is available at https://h5web.panosc.eu/h5grove.

The following HDF5 files can be reached with a URL of the form
`https://h5web.panosc.eu/h5grove?file=<name>`:

- [`water_224.h5`](https://h5web.panosc.eu/h5grove) (**default**): A typical
  NeXus file with various real-world datasets to demonstrate the visualizations.
- [`compressed.h5`](https://h5web.panosc.eu/h5grove?file=compressed.h5): A file
  with datasets compressed with various filters to test decompression.
- [`epics.h5`](https://h5web.panosc.eu/h5grove?file=epics.h5): A test file from
  [EPICS](https://epics.anl.gov/) group (Argonne national lab).
- [`grove.h5`](https://h5web.panosc.eu/h5grove?file=grove.h5): A file used to
  test the provider. It contains datasets with NaN/Infinity values, booleans,
  complexes and other types of datasets such as RGB images and 4D stacks.
- [`links.h5`](https://h5web.panosc.eu/h5grove?file=links.h5): A file with
  external links, soft links and a virtual dataset to test link resolution.
- [`tall.h5`](https://h5web.panosc.eu/h5grove?file=tall.h5): The demo file of
  HSDS.

### [HSDS](https://github.com/HDFGroup/hsds)

This demo is available at https://h5web.panosc.eu/hsds.

All the HDF5 files mentionned above can be reached with a URL of the form
`https://h5web.panosc.eu/hsds?file=<name>`. https://h5web.panosc.eu/hsds will
default to `water_224.h5` but some datasets cannot be displayed as bitshuffle
compression is not supported by HSDS yet.

### [H5Wasm](https://github.com/usnistgov/h5wasm)

This demo is available at https://h5web.panosc.eu/h5wasm. Just drop an HDF5 file
from your local machine to get started.

### Mock data

At https://h5web.panosc.eu/mock, you can view a set of mock data generated
entirely on the front-end. This demo and its provider, `MockProvider` are used
for end-to-end testing purposes.
