import { db } from '@/db';
import { jobs, categories, locations } from '@/db/schema';
import { eq, and, or, gte, lte, desc, asc, sql, inArray } from 'drizzle-orm';
import type { Job, Category, Location, SearchFilters, Pagination, JobAPIResponse, JobDetailResponse } from '../types';

export const getJobs = async (options: SearchFilters & { page?: number; limit?: number }): Promise<JobAPIResponse> => {
  const page = options.page || 1;
  const limit = options.limit || 12;
  const offset = (page - 1) * limit;

  const whereConditions = [];
  if (options.search) {
    const searchTerm = `%${options.search}%`;
    whereConditions.push(or(
      sql`title LIKE ${searchTerm}`,
      sql`department LIKE ${searchTerm}`,
      sql`description LIKE ${searchTerm}`
    ));
  }
  if (options.category) whereConditions.push(eq(jobs.category, options.category));
  if (options.state) whereConditions.push(eq(jobs.state, options.state));
  if (options.location) whereConditions.push(eq(jobs.location, options.location));
  if (options.jobType) whereConditions.push(eq(jobs.jobType, options.jobType));
  if (options.salaryMin) whereConditions.push(gte(jobs.salaryMax, Number(options.salaryMin)));
  if (options.salaryMax) whereConditions.push(lte(jobs.salaryMin, Number(options.salaryMax)));
  
  if (options.savedOnly && options.savedJobIds && options.savedJobIds.length > 0) {
    whereConditions.push(inArray(jobs.id, options.savedJobIds));
  } else if (options.savedOnly) {
     whereConditions.push(sql`1=0`); // Return no results if savedOnly is true but no IDs
  }

  const finalWhere = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(jobs).where(finalWhere);
  const total = totalResult[0].count;
  
  let orderBy;
  const sortDirection = options.sortOrder === 'asc' ? asc : desc;
  switch (options.sortBy) {
    case 'salary':
      orderBy = sortDirection(jobs.salaryMax);
      break;
    case 'deadline':
      orderBy = sortDirection(jobs.applicationDeadline);
      break;
    case 'title':
      orderBy = sortDirection(jobs.title);
      break;
    default:
      orderBy = sortDirection(jobs.postedDate);
  }

  const jobResults = await db.select().from(jobs).where(finalWhere).orderBy(orderBy).limit(limit).offset(offset);

  const totalPages = Math.ceil(total / limit);
  const pagination: Pagination = {
    page, limit, total, totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return { jobs: jobResults as Job[], pagination };
};

export const getJobById = async (id: number): Promise<JobDetailResponse> => {
    const jobResult = await db.select().from(jobs).where(eq(jobs.id, id));
    const job = jobResult[0] as Job;

    if (!job) {
        throw new Error(`Job with id ${id} not found`);
    }

    const relatedJobs = await db.select().from(jobs)
        .where(and(eq(jobs.category, job.category), sql`id != ${job.id}`))
        .orderBy(desc(jobs.postedDate))
        .limit(3);

    return { job, relatedJobs: relatedJobs as Job[] };
};

export const getCategories = async (): Promise<Category[]> => {
  return await db.select().from(categories).orderBy(asc(categories.name)) as Category[];
};

export const getLocations = async (): Promise<Location[]> => {
    return await db.select().from(locations).orderBy(asc(locations.city)) as Location[];
};

export const getStates = async (): Promise<string[]> => {
  const rows = await db.selectDistinct({ state: locations.state }).from(locations).orderBy(asc(locations.state));
  return rows.map(row => row.state);
};