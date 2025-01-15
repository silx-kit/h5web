/// <reference types="vite/client" />

// HDF5 compression plugins
declare module '*.so' {
  const src: string;
  export default src;
}
