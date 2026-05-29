/**
 * Decodes a raw base64 zlib-compressed Path of Building import code into its XML string.
 * Supports both standard and URL-safe base64, with or without padding.
 */
export async function decode(code: string): Promise<string> {
  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error('PoB code cannot be empty');
  }

  // Normalize URL-safe characters to standard Base64 characters
  let base64 = trimmed.replace(/-/g, '+').replace(/_/g, '/');

  // Add back missing padding if necessary
  const remainder = base64.length % 4;
  if (remainder === 2) {
    base64 += '==';
  } else if (remainder === 3) {
    base64 += '=';
  } else if (remainder === 1) {
    throw new Error('Invalid base64 string length');
  }

  // Decode Base64 to binary string
  let binaryString: string;
  try {
    binaryString = atob(base64);
  } catch (err) {
    throw new Error(`Failed to decode base64: ${(err as Error).message}`);
  }

  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Decompress using DecompressionStream ('deflate')
  try {
    const decompressedBytes = await decompressStream(bytes);
    return new TextDecoder().decode(decompressedBytes);
  } catch (err) {
    throw new Error(`Failed to decompress PoB XML: ${(err as Error).message}`);
  }
}

/**
 * Encodes an XML build string into a URL-safe, zlib-compressed base64 Path of Building import code.
 */
export async function encode(xml: string): Promise<string> {
  const bytes = new TextEncoder().encode(xml);
  let compressedBytes: Uint8Array;
  try {
    compressedBytes = await compressStream(bytes);
  } catch (err) {
    throw new Error(`Failed to compress XML: ${(err as Error).message}`);
  }

  // Convert compressed bytes to binary string
  let binary = '';
  const len = compressedBytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(compressedBytes[i]);
  }

  // Encode to base64
  const base64 = btoa(binary);

  // Convert to URL-safe base64 and strip padding (which is standard for PoB sharing)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Helper to decompress bytes using DecompressionStream
 */
async function decompressStream(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  }).pipeThrough(new DecompressionStream('deflate'));

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

/**
 * Helper to compress bytes using CompressionStream
 */
async function compressStream(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  }).pipeThrough(new CompressionStream('deflate'));

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
