import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchFilters } from '@/components/search/SearchFilters';
import { JobList } from '@/components/jobs/JobList';
import { JobDetail } from '@/components/jobs/JobDetail';
import { Job, Category, Location, SearchFilters as SearchFiltersType, JobAPIResponse, Pagination, JobDetailResponse } from '@/types';
import { useSavedJobs } from '@/hooks/useSavedJobs';

const HomePage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [states, setStates] = useState<string[]>([]);
  
  const [isInitialDataLoading, setIsInitialDataLoading] = useState<boolean>(true);
  const [isJobsLoading, setIsJobsLoading] = useState<boolean>(true);
  const [isJobDetailLoading, setIsJobDetailLoading] = useState<boolean>(false);
  
  const [selectedJob, setSelectedJob] = useState<JobDetailResponse | null>(null);
  const { savedJobIds, toggleSaveJob, isSavedJobsLoaded } = useSavedJobs();

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 12,
    hasNext: false,
    hasPrev: false,
  });
  
  const initialFilters: SearchFiltersType = {
    search: '',
    category: '',
    location: '',
    state: '',
    jobType: '',
    sortBy: 'posted_date',
    sortOrder: 'desc',
    savedOnly: false,
  };
  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters);

  const fetchJobs = useCallback(async (currentFilters: SearchFiltersType, page: number) => {
    setIsJobsLoading(true);
    try {
      const { savedOnly, ...otherFilters } = currentFilters;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      
      for (const [key, value] of Object.entries(otherFilters)) {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      }

      if (savedOnly) {
        params.set('savedOnly', 'true');
        params.set('savedJobIds', savedJobIds.join(','));
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data: JobAPIResponse = await response.json();
      
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error)      {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    } finally {
      setIsJobsLoading(false);
    }
  }, [savedJobIds]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catsRes, locsRes, statesRes] = await Promise.all([
          fetch('/api/meta?type=categories'),
          fetch('/api/meta?type=locations'),
          fetch('/api/meta?type=states'),
        ]);
        const [cats, locs, sts] = await Promise.all([
            catsRes.json(),
            locsRes.json(),
            statesRes.json(),
        ]);
        setCategories(cats);
        setLocations(locs);
        setStates(sts);
      } catch (error) {
        console.error("Failed to fetch initial filter data:", error);
      } finally {
        setIsInitialDataLoading(false);
      }
    };
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    if (!isInitialDataLoading && !selectedJob && isSavedJobsLoaded) {
      fetchJobs(filters, 1);
    }
  }, [filters, fetchJobs, isInitialDataLoading, selectedJob, isSavedJobsLoaded]);

  const handleFilterChange = (newFilters: SearchFiltersType) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchJobs(filters, newPage);
    }
  };
  
  const handleSelectJob = async (jobId: number) => {
    setIsJobDetailLoading(true);
    window.scrollTo(0, 0);
    try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch job details');
        const jobData = await response.json();
        setSelectedJob(jobData);
    } catch(error) {
        console.error("Failed to fetch job details:", error);
    } finally {
        setIsJobDetailLoading(false);
    }
  };

  const handleClearSelectedJob = () => {
    setSelectedJob(null);
  };

  return (
    <>
    <Head>
        <title>GovJobAlert - Find Your Next Government Job</title>
        <meta name="description" content="Your one-stop platform for the latest government job openings across India." />
        <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className="min-h-screen flex flex-col font-sans text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {selectedJob || isJobDetailLoading ? (
            <JobDetail 
                data={selectedJob}
                isLoading={isJobDetailLoading}
                onBack={handleClearSelectedJob}
                savedJobIds={savedJobIds}
                onToggleSave={toggleSaveJob}
                onSelectJob={handleSelectJob}
            />
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Find Your Dream Government Job</h1>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Your one-stop platform for the latest government job openings across India.
              </p>
            </div>
            
            <SearchFilters
              categories={categories}
              locations={locations}
              states={states}
              onFiltersChange={handleFilterChange}
              disabled={isInitialDataLoading || !isSavedJobsLoaded}
              initialFilters={initialFilters}
            />

            <JobList 
              jobs={jobs} 
              isLoading={isInitialDataLoading || isJobsLoading || !isSavedJobsLoaded} 
              pagination={pagination}
              onPageChange={handlePageChange}
              savedJobIds={savedJobIds}
              onToggleSave={toggleSaveJob}
              onSelectJob={handleSelectJob}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
    </>
  );
};

export default HomePage;