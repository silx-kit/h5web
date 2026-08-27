import { useEffect } from 'react';

/* Creating the first WebGL context in a page costs a few hundred milliseconds
   of blocking main-thread time, most of it GPU-process and graphics-driver
   initialisation rather than anything h5web does. Pay it in the background,
   while the user is still browsing the file tree, so that opening the first
   visualisation doesn't have to. */
export function useWarmUpWebGL(): void {
  useEffect(() => {
    let context: WebGL2RenderingContext | null = null;
    let handle: number | undefined;

    // Warming up is best-effort, so skip it where `requestIdleCallback` is unsupported
    if ('requestIdleCallback' in globalThis) {
      handle = globalThis.requestIdleCallback(() => {
        /* Keep the context around for the session: releasing it lets the
           browser tear down the GPU process again, which is the cost being
           avoided in the first place. */
        context = document.createElement('canvas').getContext('webgl2');
      });
    }

    return () => {
      if (handle !== undefined) {
        globalThis.cancelIdleCallback(handle);
      }

      context?.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);
}
