import { JupyterStableApi } from './api';

export class JupyterDevApi extends JupyterStableApi {
  /* API compatible with jupyterlab_hdf v0.5.1 */
  public constructor(url: string, filepath: string) {
    super(url, filepath);
    // eslint-disable-next-line no-console
    console.warn('Using Jupyter dev API');
  }
}
