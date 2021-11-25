import type { ArrayShape, Dataset, ScalarShape } from '@h5web/shared';

export interface ValuesStoreParams {
  dataset: Dataset<ScalarShape | ArrayShape>;
  selection?: string | undefined;
}

export enum ProviderError {
  FileNotFound = 'File not found',
  EntityNotFound = 'Entity not found',
  UnresolvableLink = 'Cannot resolve soft link',
  Cancelled = 'Request cancelled',
}
