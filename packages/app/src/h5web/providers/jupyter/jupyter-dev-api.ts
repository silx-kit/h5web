import { JupyterStableApi } from './jupyter-api';

export class JupyterDevApi extends JupyterStableApi {
  /* API compatible with jupyterlab_hdf@<commit-sha> */
  public constructor(url: string, filepath: string) {
    super(url, filepath);
    console.warn('Using Jupyter dev API'); // eslint-disable-line no-console
  }
}
