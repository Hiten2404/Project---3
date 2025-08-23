import db from './database';
import type { Job, Category, Location, SearchFilters, Pagination, JobAPIResponse, JobDetailResponse } from '../types';

export const getJobs = (options: SearchFilters & { page?: number; limit?: number }): JobAPIResponse => {
  let baseQuery = `SELECT * FROM jobs`;
  let countQuery = `SELECT count(*) as total FROM jobs`;
  const whereClauses: string[] = [];
  const params: (string | number)[] = [];

  const addClause = (field: string, operator: string, value: any) => {
      whereClauses.push(`${field} ${operator} ?`);
      params.push(value);
  }

  if (options.search) {
      const searchTerm = `%${options.search}%`;
      whereClauses.push(`(title LIKE ? OR department LIKE ? OR description LIKE ?)`);
      params.push(searchTerm, searchTerm, searchTerm);
  }
  if (options.category) addClause('category', '=', options.category);
  if (options.state) addClause('state', '=', options.state);
  if (options.location) addClause('location', '=', options.location);
  if (options.jobType) addClause('job_type', '=', options.jobType);
  if (options.salaryMin) addClause('salary_max', '>=', Number(options.salaryMin));
  if (options.salaryMax) addClause('salary_min', '<=', Number(options.salaryMax));

  if (options.savedOnly && options.savedJobIds && options.savedJobIds.length > 0) {
    const placeholders = options.savedJobIds.map(() => '?').join(',');
    whereClauses.push(`id IN (${placeholders})`);
    params.push(...options.savedJobIds);
  } else if (options.savedOnly) {
    whereClauses.push('1=0');
  }

  if (whereClauses.length > 0) {
    const whereString = ` WHERE ${whereClauses.join(' AND ')}`;
    baseQuery += whereString;
    countQuery += whereString;
  }

  const totalRow = db.prepare(countQuery).get(...params) as { total: number };
  const total = totalRow.total;

  const sortBy = options.sortBy || 'posted_date';
  const sortOrder = options.sortOrder || 'desc';
  let orderBy = `ORDER BY ${sortBy === 'salary' ? 'salary_max' : sortBy}`;
  baseQuery += ` ${orderBy} ${sortOrder.toUpperCase()}`;
  
  const page = options.page || 1;
  const limit = options.limit || 12;
  const offset = (page - 1) * limit;
  baseQuery += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  const jobs = db.prepare(baseQuery).all(...params) as Job[];

  const totalPages = Math.ceil(total / limit);
  const pagination: Pagination = {
    page, limit, total, totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return { jobs, pagination };
};

export const getJobById = (id: number): JobDetailResponse => {
    const jobStmt = db.prepare(`SELECT * FROM jobs WHERE id = ?`);
    const job = jobStmt.get(id) as Job;

    if (!job) {
        throw new Error(`Job with id ${id} not found`);
    }

    const relatedJobsStmt = db.prepare(`SELECT * FROM jobs WHERE category = ? AND id != ? ORDER BY posted_date DESC LIMIT 3`);
    const relatedJobs = relatedJobsStmt.all(job.category, job.id) as Job[];

    return { job, relatedJobs };
};

export const getCategories = (): Category[] => {
  return db.prepare("SELECT * FROM categories ORDER BY name ASC").all() as Category[];
};

export const getLocations = (): Location[] => {
    return db.prepare("SELECT * FROM locations ORDER BY city ASC").all() as Location[];
};

export const getStates = (): string[] => {
  const rows = db.prepare("SELECT DISTINCT state FROM locations ORDER BY state ASC").all() as {state: string}[];
  return rows.map(row => row.state);
};
