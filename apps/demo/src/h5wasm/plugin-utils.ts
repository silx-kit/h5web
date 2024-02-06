// Import compression plugins as static assets (i.e. as URLs)
// cf. `vite.config.ts` and `src/vite-env.d.ts
import { Plugin } from '@h5web/h5wasm';
import blosc from 'h5wasm-plugins/plugins/libH5Zblosc.so';
import blosc2 from 'h5wasm-plugins/plugins/libH5Zblosc2.so';
import bshuf from 'h5wasm-plugins/plugins/libH5Zbshuf.so';
import bz2 from 'h5wasm-plugins/plugins/libH5Zbz2.so';
import lz4 from 'h5wasm-plugins/plugins/libH5Zlz4.so';
import lzf from 'h5wasm-plugins/plugins/libH5Zlzf.so';
import szf from 'h5wasm-plugins/plugins/libH5Zszf.so';
import zfp from 'h5wasm-plugins/plugins/libH5Zzfp.so';
import zstd from 'h5wasm-plugins/plugins/libH5Zzstd.so';

const PLUGINS: Record<Plugin, string> = {
  [Plugin.Blosc]: blosc,
  [Plugin.Blosc2]: blosc2,
  [Plugin.Bitshuffle]: bshuf,
  [Plugin.BZIP2]: bz2,
  [Plugin.LZ4]: lz4,
  [Plugin.LZF]: lzf,
  [Plugin.SZ]: szf,
  [Plugin.ZFP]: zfp,
  [Plugin.Zstandard]: zstd,
};

export async function getPlugin(
  name: Plugin,
): Promise<ArrayBuffer | undefined> {
  if (!PLUGINS[name]) {
    return undefined;
  }

  const response = await fetch(PLUGINS[name]);
  return response.arrayBuffer();
}
