export async function download(
  url: URL | (() => Promise<URL | Blob>),
  filename: string,
) {
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
