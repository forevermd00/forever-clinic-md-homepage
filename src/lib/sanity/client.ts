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
    useCdn: true,
  });
}

export const client = createSanityClient();
