import type { ExportFormat, ExportURL, ValuesStoreParams } from '@h5web/app';
import { DataProviderApi } from '@h5web/app';
import { assertNonNull } from '@h5web/shared/guards';
import type {
  ArrayShape,
  Dataset,
  Entity,
  ProvidedEntity,
  Value,
} from '@h5web/shared/hdf5-models';
import { getNameFromPath } from '@h5web/shared/hdf5-utils';
import type { Filter, Module } from 'h5wasm';
import {
  File as H5WasmFile,
  Group as H5WasmGroup,
  ready as h5wasmReady,
} from 'h5wasm';
import { nanoid } from 'nanoid';

import { assertH5WasmDataset } from './guards';
import type { H5WasmEntity, Plugin } from './models';
import {
  getEnhancedError,
  hasBigInts,
  parseEntity,
  PLUGINS_BY_FILTER_ID,
  readSelectedValue,
  sanitizeBigInts,
} from './utils';

const PLUGINS_PATH = '/plugins'; // path to plugins on EMScripten virtual file system

export class H5WasmApi extends DataProviderApi {
  private readonly h5wasm: Promise<typeof Module>;
  private readonly file: Promise<H5WasmFile>;

  public constructor(
    filename: string,
    buffer: ArrayBuffer,
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
    private readonly getPlugin?: (
      name: Plugin,
    ) => Promise<ArrayBuffer | undefined>,
  ) {
    super(filename);

    this.h5wasm = this.initH5Wasm();
    this.file = this.initFile(buffer);
  }

  public override async getEntity(path: string): Promise<ProvidedEntity> {
    const h5wEntity = await this.getH5WasmEntity(path);
    return parseEntity(getNameFromPath(path), path, h5wEntity);
  }

  public override async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset, selection } = params;

    const h5wDataset = await this.getH5WasmEntity(dataset.path);
    assertH5WasmDataset(h5wDataset);

    // Ensure all filters are supported and loaded (if available)
    await this.processFilters(h5wDataset.filters);

    try {
      const value = readSelectedValue(h5wDataset, selection);
      return hasBigInts(dataset.type) ? sanitizeBigInts(value) : value;
    } catch (error) {
      throw getEnhancedError(error);
    }
  }

  public override async getAttrValues(entity: Entity) {
    const h5wEntity = await this.getH5WasmEntity(entity.path);

    if (!('attrs' in h5wEntity)) {
      throw new TypeError('Expected H5Wasm entity with attributes');
    }

    return Object.fromEntries(
      Object.entries(h5wEntity.attrs).map(([name, attr]) => {
        return [name, attr.to_array()];
      }),
    );
  }

  public override getExportURL<D extends Dataset<ArrayShape>>(
    format: ExportFormat,
    dataset: D,
    selection: string | undefined,
    value: Value<D>,
  ): ExportURL {
    const url = this._getExportURL?.(format, dataset, selection, value);
    if (url) {
      return url;
    }

    if (format === 'json') {
      return async () => new Blob([JSON.stringify(value, null, 2)]);
    }

    return undefined;
  }

  public override async getSearchablePaths(root: string): Promise<string[]> {
    const file = await this.file;

    const h5wEntity = file.get(root);

    if (h5wEntity instanceof H5WasmGroup) {
      // Build absolute paths since .paths() are relative
      return h5wEntity.paths().map((path) => `${root}${path}`);
    }

    return [];
  }

  public async cleanUp(): Promise<void> {
    const file = await this.file;
    file.close();
  }

  private async initH5Wasm(): Promise<typeof Module> {
    const module = await h5wasmReady;

    // Throw HDF5 errors instead of just logging them
    module.activate_throwing_error_handler();

    // Replace default plugins path
    module.remove_plugin_search_path(0);
    module.insert_plugin_search_path(PLUGINS_PATH, 0);

    // Create plugins folder on Emscripten virtual file system
    module.FS.mkdirTree(PLUGINS_PATH);

    return module;
  }

  private async initFile(buffer: ArrayBuffer): Promise<H5WasmFile> {
    const h5Module = await this.h5wasm;

    // Write HDF5 file to Emscripten virtual file system
    // https://emscripten.org/docs/api_reference/Filesystem-API.html#FS.writeFile
    const id = nanoid(); // use unique ID instead of `this.filepath` to avoid slashes and other unsupported characters
    h5Module.FS.writeFile(id, new Uint8Array(buffer), { flags: 'w+' });

    return new H5WasmFile(id, 'r');
  }

  private async getH5WasmEntity(
    path: string,
  ): Promise<NonNullable<H5WasmEntity>> {
    const file = await this.file;

    const h5wEntity = file.get(path);
    assertNonNull(
      h5wEntity,
      path === '/' ? `Expected valid HDF5 file` : `No entity found at ${path}`,
    );

    return h5wEntity;
  }

  private async processFilters(filters: Filter[]): Promise<void> {
    const h5Module = await this.h5wasm;

    for await (const filter of filters) {
      if (filter.id < h5Module.H5Z_FILTER_RESERVED) {
        continue; // filter supported out of the box
      }

      const plugin = PLUGINS_BY_FILTER_ID[filter.id];
      if (!plugin) {
        // eslint-disable-next-line no-console
        console.warn(
          `Compression filter ${filter.id} not supported (${filter.name})`,
        );
        continue;
      }

      const pluginPath = `${PLUGINS_PATH}/libH5Z${plugin}.so`;

      if (h5Module.FS.analyzePath(pluginPath).exists) {
        continue; // plugin already loaded
      }

      const buffer = await this.getPlugin?.(plugin);
      if (!buffer) {
        // eslint-disable-next-line no-console
        console.warn(`Compression plugin ${plugin} not available`);
        continue;
      }

      h5Module.FS.writeFile(pluginPath, new Uint8Array(buffer));
    }
  }
}
