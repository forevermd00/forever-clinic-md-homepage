import { createClient, type SanityClient } from 'next-sanity';
import { projectId, dataset, apiVersion } from './config';

function createSanityClient(): SanityClient | null {
  if (!projectId) {
    return null;
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: process.env.NODE_ENV === 'production',
    token: process.env.SANITY_API_TOKEN,
  });
}

export const client = createSanityClient();
