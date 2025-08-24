import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategories, getLocations, getStates } from '@/lib/api';
import { Category, Location } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Category[] | Location[] | string[] | { error: string }>
) {
  if (req.method === 'GET') {
    const { type } = req.query;
    try {
        if (type === 'categories') {
            const data = await getCategories();
            return res.status(200).json(data);
        }
        if (type === 'locations') {
            const data = await getLocations();
            return res.status(200).json(data);
        }
        if (type === 'states') {
            const data = await getStates();
            return res.status(200).json(data);
        }
        return res.status(400).json({ error: 'Invalid meta type specified.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch meta data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}