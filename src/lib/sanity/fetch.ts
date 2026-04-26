import { client } from './client';

/**
 * Fetch from Sanity with fallback. If Sanity is not configured or query fails,
 * returns the fallback value.
 */
export async function sanityFetch<T>(
  query: string,
  params?: Record<string, unknown>,
  fallback?: T,
): Promise<T | null> {
  if (!client) {
    return fallback ?? null;
  }
  try {
    const data = await client.fetch<T>(query, params ?? {});
    return data ?? fallback ?? null;
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return fallback ?? null;
  }
}
