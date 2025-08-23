
import React from 'react';
import type { Job, Pagination } from '../../types';
import { JobCard } from './JobCard';
import { Skeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';

interface JobListProps {
  jobs: Job[];
  isLoading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  savedJobIds: number[];
  onToggleSave: (jobId: number) => void;
  onSelectJob: (jobId: number) => void;
}

const JobCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 space-y-4">
    <div className="flex justify-between">
      <div className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-36" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex justify-between items-center pt-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
  </div>
);

export const JobList: React.FC<JobListProps> = ({ jobs, isLoading, pagination, onPageChange, savedJobIds, onToggleSave, onSelectJob }) => {
  const savedJobIdsSet = new Set(savedJobIds);

  return (
    <div className="mt-8">
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && jobs.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job, index) => (
              <JobCard 
                key={job.id} 
                job={job}
                variant={index < 2 ? 'featured' : 'default'}
                isSaved={savedJobIdsSet.has(job.id)}
                onToggleSave={onToggleSave}
                onSelectJob={onSelectJob}
              />
            ))}
          </div>
          <div className="flex justify-center items-center mt-12 space-x-4">
            <Button onClick={() => onPageChange(pagination.page - 1)} disabled={!pagination.hasPrev}>
              Previous
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button onClick={() => onPageChange(pagination.page + 1)} disabled={!pagination.hasNext}>
              Next
            </Button>
          </div>
        </>
      )}

      {!isLoading && jobs.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-lg">
          <h3 className="text-xl font-semibold">No Jobs Found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};