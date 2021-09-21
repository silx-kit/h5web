export interface ValuesStoreParams {
  path: string;
  selection?: string | undefined;
}

export enum ProviderError {
  NotFound = 'Entity not found',
  Cancelled = 'Request cancelled',
}
