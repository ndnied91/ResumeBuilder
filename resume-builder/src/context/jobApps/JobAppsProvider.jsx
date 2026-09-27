import { useMemo, useState, useCallback } from 'react';
import { JobAppsContext } from './JobAppsContext';

export function JobAppsProvider({ children }) {
  const [jobApps, setJobApps] = useState([]);

  const getJobApps = useCallback(async (getToken, dbId) => {
    try {
      const token = await getToken();

      const res = await fetch(`/api/users/${dbId}/job-applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.log('Error:', data);
        return;
      }

      setJobApps(data);
    } catch (error) {
      console.error('Failed to fetch job apps:', error);
    }
  }, []);

  const value = useMemo(
    () => ({ jobApps, setJobApps, getJobApps }),
    [jobApps, getJobApps],
  );

  return (
    <JobAppsContext.Provider value={value}>{children}</JobAppsContext.Provider>
  );
}
