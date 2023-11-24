import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = fileURLToPath(new URL('.', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.resolve(dirname, 'package.json')));

/*
 * Since `@h5web/shared` is not published, its type declarations must be
 * inlined into the compiled declaration file of each published package.
 *
 * The object below tells `rollup-plugin-dts` how to map `@h5web/shared/*`
 * imports to their corresponding declaration files.
 *
 * e.g. @h5web/shared/utils => ../shared/dist-ts/utils.d.ts
 */
export const aliasEntries = Object.fromEntries(
  Object.entries(pkg.exports)
    .filter(([, value]) => value.endsWith('.ts'))
    .map(([key, value]) => [
      key.replace(/^\./u, '@h5web/shared'),
      value.replace(/^\.\/src\/(.+)\.ts$/u, '../shared/dist-ts/$1.d.ts'),
    ]),
);
