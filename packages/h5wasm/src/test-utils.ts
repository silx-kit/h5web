import { server } from 'vitest/browser';

const { readFile } = server.commands;

const PATH = '../../support/files/dist'; // relative to `@h5web/h5wasm` project root

export async function readFileAsBuffer(filename: string): Promise<ArrayBuffer> {
  const { buffer } = Uint8Array.fromBase64(
    await readFile(`${PATH}/${filename}`, 'base64'),
  );

  return buffer;
}
