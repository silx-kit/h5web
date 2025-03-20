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
[myHDF5](https://myhdf5.hdfgroup.org/), at the
[Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=h5web.vscode-h5web)
or at the [JupyterLab extension](https://github.com/silx-kit/jupyterlab-h5web).

![H5Web GIF demo](https://user-images.githubusercontent.com/2936402/107791492-4c512980-6d54-11eb-8ba4-4a1433bdfeea.gif)

## NPM packages 📚

### [@h5web/lib](https://www.npmjs.com/package/@h5web/lib)

H5Web's component library, which includes the main visualization components
(`LineVis`, `HeatmapVis`, etc.) as well as some of their lower-level building
blocks (`VisCanvas`, `ColorBar`, etc.)

The library is documented in a Storybook site accessible at
https://h5web-docs.panosc.eu.

Some examples of usage of `@h5web/lib`:

| Multiple curves                                                                                                                                                                                     | Heatmap with color bar                                                                                                                                                                                          | Gamma vs Power scale                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Multiple curves](https://github.com/silx-kit/h5web/assets/2936402/0c967dbc-b70b-43e1-93aa-f340889da01a)](https://codesandbox.io/p/sandbox/h5weblib-multiple-curves-46kppn?file=%2Fsrc%2FApp.tsx) | [![Heatmap with color bar](https://github.com/silx-kit/h5web/assets/2936402/0677a610-3812-4867-a9e6-967ec7d36675)](https://codesandbox.io/p/sandbox/h5weblib-heatmap-with-tooltip-4nc9hp?file=%2Fsrc%2FApp.tsx) | [![Gamma vs Power scale](https://github.com/silx-kit/h5web/assets/2936402/71c5bebb-7d12-4315-8382-d2e36d5240f2)](https://codesandbox.io/p/sandbox/h5weblib-gamma-vs-power-kksyd7?file=%2Fsrc%2FApp.tsx) |

### [@h5web/app](https://www.npmjs.com/package/@h5web/app)

HDF5 viewer component (`App`) and built-in data providers.

Data providers are components that fetch data from HDF5 back-end solutions and
provide this data to the app through React Context. H5Web currently includes
three providers, two of which are available in the `@h5web/app` package:

- `H5GroveProvider` for server implementations based on
  [h5grove](https://github.com/silx-kit/h5grove), like
  [jupyterlab-h5web](https://github.com/silx-kit/jupyterlab-h5web)
- `HsdsProvider` for [HSDS](https://github.com/HDFGroup/hsds)

### [@h5web/h5wasm](https://www.npmjs.com/package/@h5web/h5wasm)

This package includes two additional data providers, `H5WasmLocalFileProvider`
and `H5WasmBufferProvider`, that can read HDF5 files straight in the browser
thanks to the [h5wasm](https://github.com/usnistgov/h5wasm) library.

## Demos

The [demo app](https://h5web.panosc.eu/) demonstrates the use of the built-in
data providers and visualizations. Several demos are available, one per data
provider:

- [**H5GroveProvider**](https://h5web.panosc.eu/h5grove)
- [**HsdsProvider**](https://h5web.panosc.eu/hsds)
- [**H5WasmLocalFileProvider**](https://h5web.panosc.eu/h5wasm) (when browsing
  for a local file)
- [**H5WasmBufferProvider**](https://h5web.panosc.eu/h5wasm) (when supplying the
  URL of a remote file)
- [**MockProvider**](https://h5web.panosc.eu/mock)

## Ecosystem

Check out these projects from the H5Web ecosystem:

- [myHDF5](https://myhdf5.hdfgroup.org/) – online HDF5 file viewing service
- [jupyterlab-h5web](https://github.com/silx-kit/jupyterlab-h5web) – H5Web
  extension for JupyterLab
- [vscode-h5web](https://github.com/silx-kit/vscode-h5web) – H5Web extension for
  Visual Studio Code
- [h5whale](https://github.com/silx-kit/h5whale) – full-stack Docker application
  to visualise HDF5 files
- [h5grove](https://github.com/silx-kit/h5grove) – core utilities to serve HDF5
  file contents

## Contributing

Want to help improve H5Web? We're always looking for feedback, bug reports and
feature requests, so don't hesitate to
[open an issue](https://github.com/silx-kit/h5web/issues/new/choose) or
[start a discussion](https://github.com/silx-kit/h5web/discussions).

If you'd like to know more about contributing to the codebase, please check out
the [CONTRIBUTING](CONTRIBUTING.md) guide.
