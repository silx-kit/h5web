import { type HDF5Diag, Plugin } from './models';

// https://support.hdfgroup.org/services/contributions.html
export const PLUGINS_BY_FILTER_ID: Record<number, Plugin> = {
  307: Plugin.BZIP2,
  32_000: Plugin.LZF,
  32_001: Plugin.Blosc,
  32_004: Plugin.LZ4,
  32_008: Plugin.Bitshuffle,
  32_013: Plugin.ZFP,
  32_015: Plugin.Zstandard,
  32_017: Plugin.SZ,
  32_026: Plugin.Blosc2,
};

const DIAG_PREDICATES: ((diag: HDF5Diag) => boolean)[] = [
  (diag: HDF5Diag) => {
    return (
      diag.major === 'Data filters' &&
      /^required filter.*not registered$/iu.test(diag.message)
    );
  },
];

export function getEnhancedError(error: unknown): unknown {
  if (!(error instanceof Error) || !error.message.startsWith('HDF5-DIAG')) {
    return error;
  }

  const diagnostics = parseDiagnostics(error.message);
  const opts = { cause: error };

  for (const predicate of DIAG_PREDICATES) {
    const diag = diagnostics.find(predicate);
    if (diag) {
      return new Error(diag.message, opts);
    }
  }

  return new Error('Error detected in HDF5', opts);
}

const MESSAGE_LINE_REGEX = /#\d{3}: (\/.+ line \d+ in .+\(\)): (.+)$/u;
const MAJOR_LINE_REGEX = /major: (.+)$/u;
const MINOR_LINE_REGEX = /minor: (.+)$/u;

/* Each HDF5 diagnostic entry is made up of three lines:
 * 1. "#000: <origin>: <message>"
 * 2. "major: <major>"
 * 3. "major: <minor>"
 */
export function parseDiagnostics(msg: string): HDF5Diag[] {
  // Ignore first line (generic error) and last line (empty)
  const lines = msg.split(/\n/u).slice(1, -1);

  if (lines.length % 3 !== 0) {
    return [];
  }

  const diags: HDF5Diag[] = [];
  for (let i = 0; i < lines.length; i += 3) {
    const [, origin, message] = MESSAGE_LINE_REGEX.exec(lines[i]) || [];
    const [, major] = MAJOR_LINE_REGEX.exec(lines[i + 1]) || [];
    const [, minor] = MINOR_LINE_REGEX.exec(lines[i + 2]) || [];

    if (origin && message && major && minor) {
      diags.push({
        major,
        minor,
        message: `${message.charAt(0).toUpperCase()}${message.slice(1)}`,
        origin,
      });
    }
  }

  return diags;
}
