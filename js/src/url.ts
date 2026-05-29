import { decode } from './codec.js';

export interface ParsedUrl {
  id: string;
  rawUrl: string;
}

export interface FetchOptions {
  userAgent?: string;
  timeoutMs?: number;
}

const DEFAULT_USER_AGENT = 'pob-parser/1.0.0 (https://github.com/juddisjudd/pobpaser; contact: juddisjudd@github.com)';

/**
 * Parses pobb.in URLs to extract the paste ID and raw URL.
 * Supports:
 * - https://pobb.in/XYZ123
 * - pobb.in/XYZ123
 * - https://pobb.in/u/username/XYZ123
 * - https://pobb.in/XYZ123/raw
 */
export function parseUrl(url: string): ParsedUrl | null {
  const trimmed = url.trim();

  // Pobb.in user profile builds
  const pobbinUserRegex = /^(?:https?:\/\/)?(?:www\.)?pobb\.in\/u\/([^/]+)\/([^/]+)(?:\/raw)?/i;
  const pbuMatch = trimmed.match(pobbinUserRegex);
  if (pbuMatch) {
    const username = pbuMatch[1];
    const id = pbuMatch[2];
    return {
      id: `${username}/${id}`,
      rawUrl: `https://pobb.in/u/${username}/${id}/raw`,
    };
  }

  // Pobb.in standard builds
  const pobbinRegex = /^(?:https?:\/\/)?(?:www\.)?pobb\.in\/(?!u\/)(?:raw\/)?([^/]+)/i;
  const pbInMatch = trimmed.match(pobbinRegex);
  if (pbInMatch) {
    const id = pbInMatch[1];
    return {
      id,
      rawUrl: `https://pobb.in/${id}/raw`,
    };
  }

  return null;
}

/**
 * Fetches the raw Path of Building code from a pobb.in URL or ID.
 * If the input is a valid URL, it will be parsed to obtain the raw URL.
 * If it is an ID, it is assumed to be a standard pobb.in ID.
 */
export async function fetchRawCode(urlOrId: string, options: FetchOptions = {}): Promise<string> {
  let rawUrl = '';
  const parsed = parseUrl(urlOrId);

  if (parsed) {
    rawUrl = parsed.rawUrl;
  } else {
    // If not a URL, check if it's alphanumeric and treat as pobb.in ID
    const trimmedId = urlOrId.trim();
    if (/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)?$/.test(trimmedId)) {
      if (trimmedId.includes('/')) {
        rawUrl = `https://pobb.in/u/${trimmedId}/raw`;
      } else {
        rawUrl = `https://pobb.in/${trimmedId}/raw`;
      }
    } else {
      throw new Error(`Invalid URL or ID format: ${urlOrId}`);
    }
  }

  const userAgent = options.userAgent || DEFAULT_USER_AGENT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 10000);

  try {
    const response = await fetch(rawUrl, {
      headers: {
        'User-Agent': userAgent,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch build: HTTP ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    return text.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    if ((err as Error).name === 'AbortError') {
      throw new Error(`Request timed out for URL: ${rawUrl}`);
    }
    throw new Error(`Failed to fetch from ${rawUrl}: ${(err as Error).message}`);
  }
}

/**
 * Fetches the raw Path of Building code from a URL or ID and decodes it to XML.
 */
export async function fetchAndDecode(urlOrId: string, options: FetchOptions = {}): Promise<string> {
  const rawCode = await fetchRawCode(urlOrId, options);
  return decode(rawCode);
}
