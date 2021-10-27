export interface ValuesStoreParams {
  path: string;
  selection?: string | undefined;
}

export enum ProviderError {
  FileNotFound = 'File not found',
  EntityNotFound = 'Entity not found',
  Cancelled = 'Request cancelled',
}
