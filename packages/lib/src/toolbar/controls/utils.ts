export async function download(
  url: URL | (() => Promise<URL | Blob>),
  filename: string,
): Promise<void> {
  const urlOrBlob = url instanceof URL ? url : await url();

  const anchor = document.createElement('a');
  anchor.download = filename;
  document.body.append(anchor);

  anchor.href =
    urlOrBlob instanceof Blob ? URL.createObjectURL(urlOrBlob) : urlOrBlob.href;
  anchor.click();

  URL.revokeObjectURL(anchor.href);
  anchor.remove();
}

export function getAllOptions<T>(options: Record<string, T[]> | T[]): T[] {
  return Array.isArray(options) ? options : Object.values(options).flat();
}
