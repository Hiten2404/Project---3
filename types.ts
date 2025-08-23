
export interface Job {
  id: number;
  title: string;
  department: string;
  category: string; // slug of category
  location: string; // slug of location
  state: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceRequired?: string;
  educationRequired?: string;
  applicationDeadline?: string; // ISO date string
  postedDate: string; // ISO date string
  jobType: 'permanent' | 'contract' | 'temporary';
  employmentType: 'full-time' | 'part-time';
  description?: string;
  applicationUrl?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Location {
  id: number;
  city: string;
  state: string;
  slug: string;
}

export interface SearchFilters {
  search?: string;
  category?: string;
  location?: string;
  state?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: 'permanent' | 'contract' | 'temporary' | '';
  sortBy?: 'posted_date' | 'deadline' | 'salary' | 'title';
  sortOrder?: 'asc' | 'desc';
  savedOnly?: boolean;
  savedJobIds?: number[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface JobAPIResponse {
  jobs: Job[];
  pagination: Pagination;
}

export interface JobDetailResponse {
    job: Job;
    relatedJobs: Job[];
}