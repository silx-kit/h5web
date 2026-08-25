/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { queryOptions } from '@tanstack/react-query';

import { type DataContextValue } from '../providers/DataProvider';
import { resolvePath } from './utils';

export function resolvePathQuery(path: string, dataContext: DataContextValue) {
  return queryOptions({
    queryKey: [dataContext.filepath, 'resolution', path] as const,
    queryFn: async () => resolvePath(path, dataContext),
  });
}
