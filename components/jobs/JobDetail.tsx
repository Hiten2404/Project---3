
import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { JobCard } from './JobCard';
import { Calendar, MapPin, Clock, IndianRupee, Heart, Building2 } from '../icons';
import type { Job, JobDetailResponse } from '../../types';
import { formatCurrency, formatDate, getDaysUntilDeadline } from '../../lib/utils';

interface JobDetailProps {
    data: JobDetailResponse | null;
    isLoading: boolean;
    onBack: () => void;
    savedJobIds: number[];
    onToggleSave: (jobId: number) => void;
    onSelectJob: (jobId: number) => void;
}

const JobDetailSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-4 pt-4">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-10" />
            </div>
            <div className="space-y-4 pt-6">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-3/4" />
            </div>
        </div>
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    </div>
);

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | number | null; isUrgent?: boolean }> = ({ icon, label, value, isUrgent }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-4">
            <div className="text-slate-500 dark:text-slate-400 mt-1">{icon}</div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className={`font-medium ${isUrgent ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>{value}</p>
            </div>
        </div>
    );
};


export const JobDetail: React.FC<JobDetailProps> = ({ data, isLoading, onBack, savedJobIds, onToggleSave, onSelectJob }) => {
    if (isLoading) {
        return <JobDetailSkeleton />;
    }
    
    if (!data) {
        return (
             <div className="text-center py-16">
                <h3 className="text-xl font-semibold">Job Not Found</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">The requested job could not be loaded.</p>
                <Button onClick={onBack} variant="outline" className="mt-4">Back to Jobs</Button>
            </div>
        )
    }

    const { job, relatedJobs } = data;
    const isSaved = new Set(savedJobIds).has(job.id);
    const daysUntilDeadline = getDaysUntilDeadline(job.applicationDeadline);
    const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7;
    
    return (
        <div>
            <Button onClick={onBack} variant="ghost" className="mb-4">
                &larr; Back to all jobs
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                    <Badge variant={job.jobType === "permanent" ? "default" : "secondary"} className="capitalize">{job.jobType}</Badge>
                    <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-slate-900 dark:text-white">{job.title}</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">{job.department}</p>

                    <div className="flex flex-wrap gap-4 my-6">
                        {job.applicationUrl && (
                            <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90">
                                Apply Now
                            </a>
                        )}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onToggleSave(job.id)}
                            aria-label={isSaved ? 'Unsave job' : 'Save job'}
                            className="h-10 w-10"
                        >
                            <Heart className={`h-5 w-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
                        </Button>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                        <p>{job.description}</p>
                        {/* Here you could add more sections like responsibilities, requirements etc. if they were in the data */}
                    </div>
                </div>

                <aside className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DetailItem icon={<MapPin className="h-5 w-5" />} label="Location" value={`${job.location}, ${job.state}`} />
                            <DetailItem icon={<IndianRupee className="h-5 w-5" />} label="Salary" value={
                                job.salaryMin && job.salaryMax ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
                                : job.salaryMax ? `Up to ${formatCurrency(job.salaryMax)}`
                                : formatCurrency(job.salaryMin)
                            } />
                            <DetailItem icon={<Building2 className="h-5 w-5" />} label="Category" value={job.category} />
                            <DetailItem icon={<Calendar className="h-5 w-5" />} label="Posted On" value={formatDate(job.postedDate)} />
                            <DetailItem 
                                icon={<Clock className="h-5 w-5" />} 
                                label="Application Deadline" 
                                value={daysUntilDeadline !== null && daysUntilDeadline > 0
                                    ? `${daysUntilDeadline} days left`
                                    : formatDate(job.applicationDeadline)}
                                isUrgent={isUrgent}
                            />
                        </CardContent>
                    </Card>
                    
                    {relatedJobs.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Related Jobs</h3>
                            <div className="space-y-4">
                                {relatedJobs.map(relatedJob => (
                                    <JobCard 
                                        key={relatedJob.id}
                                        job={relatedJob}
                                        variant="compact"
                                        isSaved={new Set(savedJobIds).has(relatedJob.id)}
                                        onToggleSave={onToggleSave}
                                        onSelectJob={onSelectJob}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};
