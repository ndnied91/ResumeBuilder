import { createContext, useContext } from 'react';

export const JobAppsContext = createContext(null);

export const useJobAppsContext = () => {
  const ctx = useContext(JobAppsContext);
  if (!ctx) {
    throw new Error('useJobAppsContext must be used inside <JobAppsProvider>');
  }
  return ctx;
};
