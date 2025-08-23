import type { NextApiRequest, NextApiResponse } from 'next';
import { getJobs } from '@/lib/api';
import { JobAPIResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JobAPIResponse | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const { 
          page = '1', 
          limit = '12', 
          savedJobIds,
          ...filters 
      } = req.query;

      const savedJobIdsArray = typeof savedJobIds === 'string' && savedJobIds ? savedJobIds.split(',').map(Number) : [];

      const options = {
        ...filters,
        savedJobIds: savedJobIdsArray,
        page: Number(page),
        limit: Number(limit),
      };
      
      const data = await getJobs(options);
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
