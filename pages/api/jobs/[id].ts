import type { NextApiRequest, NextApiResponse } from 'next';
import { getJobById } from '@/lib/api';
import { JobDetailResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JobDetailResponse | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Job ID is required' });
      }
      
      const job = await getJobById(Number(id));
      res.status(200).json(job);
    } catch (error) {
      console.error(error);
      res.status(404).json({ error: 'Job not found' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
