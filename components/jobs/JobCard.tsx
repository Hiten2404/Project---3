
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Calendar, MapPin, Clock, IndianRupee, Heart } from '../icons';
import type { Job } from '../../types';
import { formatCurrency, formatDate, getDaysUntilDeadline } from '../../lib/utils';

interface JobCardProps {
  job: Job;
  variant?: "default" | "featured" | "compact";
  isSaved: boolean;
  onToggleSave: (jobId: number) => void;
  onSelectJob: (jobId: number) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, variant = "default", isSaved, onToggleSave, onSelectJob }) => {
  const daysUntilDeadline = getDaysUntilDeadline(job.applicationDeadline);
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7;

  return (
    <Card className={`group flex flex-col hover:shadow-lg transition-all duration-300 border-slate-200/80 dark:border-slate-800/80 ${variant === "featured" ? "border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10" : "bg-white dark:bg-slate-900"}`}>
      <CardHeader className={variant === "compact" ? "pb-3" : "pb-4"}>
        <div className="flex justify-between items-start gap-4">
          <div className='flex-1'>
            <CardTitle className="text-base sm:text-lg">
               <button 
                  onClick={() => onSelectJob(job.id)} 
                  className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {job.title}
                </button>
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{job.department}</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge variant={job.jobType === "permanent" ? "default" : "secondary"} className="text-xs capitalize">{job.jobType}</Badge>
            {isUrgent && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`flex-grow ${variant === "compact" ? "py-2" : "py-4"}`}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{job.location}, {job.state}</span>
            </div>
            {(job.salaryMin || job.salaryMax) && (
              <div className="flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4" />
                <span>
                  {job.salaryMin && job.salaryMax ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
                    : job.salaryMax ? `Up to ${formatCurrency(job.salaryMax)}`
                    : formatCurrency(job.salaryMin)}
                </span>
              </div>
            )}
          </div>
          
          {variant !== "compact" && job.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {job.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{job.category}</Badge>
            {job.experienceRequired && <Badge variant="outline">{job.experienceRequired}</Badge>}
            {job.educationRequired && <Badge variant="outline">{job.educationRequired}</Badge>}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex items-center justify-between w-full">
           <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
              <span>Posted {formatDate(job.postedDate)}</span>
            </div>
            {job.applicationDeadline && (
              <div className={`flex items-center gap-1.5 ${isUrgent ? "text-red-500 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
                <Clock className="h-4 w-4" />
                <span>
                  {daysUntilDeadline !== null && daysUntilDeadline > 0
                    ? `${daysUntilDeadline} days left`
                    : `Deadline ${formatDate(job.applicationDeadline)}`}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {job.applicationUrl && (
              <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-3 bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90">
                Apply Now
              </a>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500 hover:text-red-500"
              onClick={() => onToggleSave(job.id)}
              aria-label={isSaved ? 'Unsave job' : 'Save job'}
            >
              <Heart className={`h-5 w-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};