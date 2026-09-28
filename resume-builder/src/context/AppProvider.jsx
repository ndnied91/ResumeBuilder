import { useCallback, useMemo, useState } from 'react';
import { AppContext } from './app-context';
import { mapResumeToState, blankResume } from '../utils/helper';
import { useUserContext } from './user/UserContext';
import { useJobAppsContext } from './jobApps/JobAppsContext';

export function AppProvider({ children }) {
  const { userIds } = useUserContext();
  const { getJobApps } = useJobAppsContext();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobLink, setJobLink] = useState('');
  const [resumeTitle, setResumeTitle] = useState('');

  const [jobDescription, setJobDescription] = useState('');

  const [allResumes, setAllResumes] = useState([]);
  const [currResume, setCurrResume] = useState(blankResume);

  const getResumes = useCallback(async (getToken) => {
    try {
      const token = await getToken();
      const res = await fetch('/api/users/resumes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        console.log(error);
        return;
      }

      const data = await res.json();

      if (data.length) {
        setAllResumes(data);
        setCurrResume(mapResumeToState(data[0])); // take first resume for now
      }
    } catch (e) {
      console.log('error', e);
    }
  }, []);

  const createResume = useCallback(
    async (getToken, resumeOverride = null, applied) => {
      const token = await getToken();
      const resumeToSave = resumeOverride || currResume;

      try {
        const response = await fetch('/api/users/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currResume: resumeToSave,
            applied,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Save failed:', data.message);
          return;
        }

        // add new resume to all resumes
        setAllResumes((prev) => [...prev, data]);
        await getJobApps(getToken, userIds.dbId);
        return data;
      } catch (error) {
        console.error('Failed to save resume:', error);
      }
    },
    [currResume, userIds, getJobApps],
  );

  const value = useMemo(
    () => ({
      resumeFile,
      setResumeFile,
      jobLink,
      setJobLink,
      jobDescription,
      setJobDescription,
      currResume,
      setCurrResume,
      allResumes,
      setAllResumes,
      getResumes,
      createResume,
      resumeTitle,
      setResumeTitle,
    }),
    [
      resumeFile,
      jobLink,
      jobDescription,
      currResume,
      allResumes,
      getResumes,
      createResume,
      resumeTitle,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
