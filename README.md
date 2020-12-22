# H5Web, a web-based HDF5 file viewer

[![Demo](https://img.shields.io/website?down_message=offline&label=demo&up_message=online&url=https%3A%2F%2Fh5web.panosc.eu%2F)](https://h5web.panosc.eu/)

H5Web is a web-based viewer to explore HDF5 files. It is built with React and
uses [react-three-fiber](https://github.com/react-spring/react-three-fiber) for
visualizations.

![H5Web GIF demo](https://user-images.githubusercontent.com/2936402/102904182-ab3fa400-4471-11eb-9c7a-606deffebc43.gif)

## NPM packages 📚

### [@h5web/lib](https://www.npmjs.com/package/@h5web/lib)

H5Web's component library, which includes the main visualization components
(`LineVis`, `HeatmapVis`, etc.) as well as some of their lower-level building
blocks (`VisCanvas`, `ColorBar`, etc.)

The library is documented in a Storybook site accessible at
https://h5web-docs.panosc.eu.

### [@h5web/app](https://www.npmjs.com/package/@h5web/app)

H5Web's top-level `App` component and built-in data providers.

Data providers are components that fetch data from HDF5 back-end solutions and
provide this data to the app through React Context. H5Web currently includes two
providers out of the box, which are both under active development:

- `JupyterProvider` for the
  [Jupyter Lab HDF5 extension](https://github.com/jupyterlab/jupyterlab-hdf5)
- `HsdsProvider` for [HSDS](https://github.com/HDFGroup/hsds)

## Demos

The demo at https://h5web.panosc.eu/ shows the content of an HDF5 file converted
to JSON with [hdf5-json](https://github.com/HDFGroup/hdf5-json) and hosted on a
remote static server.

At https://h5web.panosc.eu/mock, you can view a set of mock data generated
entirely on the front-end. This demo and its provider, `MockProvider` are used
for end-to-end testing purposes.

### [Jupyter Lab HDF5 extension](https://github.com/jupyterlab/jupyterlab-hdf5)

This demo is available at https://h5web.panosc.eu/jupyter.

The following HDF5 files can be reached with a URL of the form
`https://h5web.panosc.eu/jupyter?domain=<name>`:

- `water_224.h5` (**default**): A file with data similar to the main demo
  https://h5web.panosc.eu/.
- `compressed.h5`: A file with datasets compressed with various filters to test
  decompression.
- `links.h5`: A file with external links, soft links and a virtual dataset to
  test link resolution.

### [HSDS](https://github.com/HDFGroup/hsds)

This demo is available at https://h5web.panosc.eu/hsds.

The following HDF5 files can be reached with a URL of the form
`https://h5web.panosc.eu/hsds?domain=<name>`:

- `/home/reader/water` (**default**): The file `water_224.h5`. Some datasets
  cannot be displayed as bitshuffle compression is not supported by HSDS yet.
- `/home/reader/links`: The file `links.h5`.
- `/home/reader/compressed`: The file `compressed.h5`.
- `/home/reader/tall`: The demo file of HSDS.
