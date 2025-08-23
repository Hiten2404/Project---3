import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'govjobalert_saved_jobs';

export const useSavedJobs = () => {
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const storedIds = localStorage.getItem(STORAGE_KEY);
      if (storedIds) {
        setSavedJobIds(new Set(JSON.parse(storedIds)));
      }
    } catch (error) {
      console.error("Failed to load saved jobs from localStorage", error);
    }
  }, []);

  const toggleSaveJob = useCallback((jobId: number) => {
    setSavedJobIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(jobId)) {
        newIds.delete(jobId);
      } else {
        newIds.add(jobId);
      }
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newIds)));
      } catch (error) {
        console.error("Failed to save jobs to localStorage", error);
      }

      return newIds;
    });
  }, []);

  return { savedJobIds: Array.from(savedJobIds), toggleSaveJob };
};
