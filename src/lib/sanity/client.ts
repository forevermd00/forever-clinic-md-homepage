import { createClient } from 'next-sanity';
import { projectId, dataset, apiVersion } from './config';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
