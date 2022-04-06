import type { ReactNode } from 'react';
import { Component } from 'react';

import Provider from '../Provider';
import { H5WasmApi } from './h5wasm-api';
import { fetchSource, getFilePath } from './utils';

// H5WasmSourceType:
//  - string indicates URL to load over http
//  - File indicates an item from the FileList of an <input type="file">
//    (for uploading directly)
export type H5WasmSourceType = string | File;

interface Props {
  source: H5WasmSourceType;
  children: ReactNode;
}

interface State {
  api?: H5WasmApi;
  error: unknown;
  source?: H5WasmSourceType;
}

export class H5WasmProvider extends Component<Props, State> {
  public componentDidMount = this.conditionalFetch.bind(this);
  public componentDidUpdate = this.componentDidMount.bind(this);

  public constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  public async conditionalFetch() {
    if (this.state.source !== this.props.source) {
      await this.loadFilePromise(); // async errors are caught in the method
    }
  }

  public render() {
    if (this.state.error !== null) {
      throw this.state.error;
    }
    if (this.state.api === undefined) {
      return <div className="error">No file loaded</div>;
    }

    return <Provider api={this.state.api}>{this.props.children}</Provider>;
  }

  private async loadFilePromise() {
    const { source } = this.props;
    try {
      // close existing fileObject if it exists...
      this.state.api?.fileObject?.close();
      const fileObject = await fetchSource(source);
      const api = new H5WasmApi(fileObject, getFilePath(source));
      this.setState({
        api,
        error: null,
        source,
      });
    } catch (error) {
      this.setState({ error, source }); // update source even if it fails to load
    }
  }
}

export default H5WasmProvider;
