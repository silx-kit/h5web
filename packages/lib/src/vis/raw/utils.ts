const MAGIC_NUMBERS = [
  [0xff, 0xd8, 0xff], // JPEG
  [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
];

export function isImage(binArray: Uint8Array): boolean {
  return MAGIC_NUMBERS.some(
    (nums) => binArray.slice(0, nums.length).toString() === nums.toString(),
  );
}
