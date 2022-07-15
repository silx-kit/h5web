# H5Web: React components for data visualization and exploration

[![Demos](https://img.shields.io/website?down_message=offline&label=demo&up_message=online&url=https%3A%2F%2Fh5web.panosc.eu%2F)](https://h5web.panosc.eu/)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.6458452.svg)](https://doi.org/10.5281/zenodo.6458452)

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

The [demo app](https://h5web.panosc.eu/) demonstrates the use of the built-in
data providers and visualizations. Several demos are available, one per data
provider:

- [**H5GroveProvider**](https://h5web.panosc.eu/h5grove)
- [**HsdsProvider**](https://h5web.panosc.eu/hsds)
- [**H5WasmProvider**](https://h5web.panosc.eu/h5wasm)
- [**MockProvider**](https://h5web.panosc.eu/mock)

## Ecosystem

Check out these projects from the growing H5Web ecosystem:

- [h5grove](https://github.com/silx-kit/h5grove) - core utilities to serve HDF5
  file contents
- [jupyterlab-h5web](https://github.com/silx-kit/jupyterlab-h5web) - H5Web
  extension for JupyterLab
- [vscode-h5web](https://github.com/silx-kit/vscode-h5web) - H5Web extension for
  Visual Studio Code

## Contributing

Want to help us improve H5Web? Check out the [CONTRIBUTING](CONTRIBUTING.md)
guide to get started.
