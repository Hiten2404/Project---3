import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { jobs } from '@/db/schema';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

const createJobSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  department: z.string().min(1),
  category: z.string().min(1),
  location: z.string().min(1),
  state: z.string().min(1),
  salaryMin: z.number().optional().nullable(),
  salaryMax: z.number().optional().nullable(),
  experienceRequired: z.string().optional().nullable(),
  educationRequired: z.string().optional().nullable(),
  applicationDeadline: z.string().optional().nullable(),
  postedDate: z.string().min(1),
  jobType: z.enum(['permanent', 'contract', 'temporary']).optional().nullable(),
  employmentType: z.enum(['full-time', 'part-time']).optional().nullable(),
  description: z.string().optional().nullable(),
  applicationUrl: z.string().optional().nullable(),
});

const bulkImportSchema = z.object({
  data: z.array(createJobSchema),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { data: incomingJobs } = bulkImportSchema.parse(req.body);
    
    let processedCount = 0;
    const errors: string[] = [];

    for (const jobData of incomingJobs) {
      try {
        await db.insert(jobs)
          .values(jobData)
          .onConflictDoUpdate({
            target: jobs.id,
            set: {
              ...jobData,
            }
          });
        
        processedCount++;

      } catch (error: any) {
        errors.push(`Failed to process job ID ${jobData.id}: ${error.message}`);
      }
    }

    res.status(200).json({
      summary: {
        processed: processedCount,
        failed: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data format', details: error.issues });
    }
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Bulk import failed' });
  }
}