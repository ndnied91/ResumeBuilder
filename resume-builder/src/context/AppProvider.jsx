import { useState } from 'react';
import { AppContext } from './app-context';
import { mapResumeToState, blankResume, seedResume } from '../utils/helper';

export function AppProvider({ children }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobLink, setJobLink] = useState('');
  const [userPane, setUserPane] = useState('dashboard');
  const [userIds, setUserIds] = useState();
  const [allResumes, setAllResumes] = useState([]);
  const [currResume, setCurrResume] = useState(blankResume);
  const [jobApps, setJobApps] = useState([]);

  const getResumes = async (getToken) => {
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

      console.log('raw:', data);

      if (data.length > 0) {
        setAllResumes(data);
        const resume = data[0]; // take first resume for now
        const mapped = mapResumeToState(resume);
        // console.log('mapped:', mapped);

        setCurrResume(mapped);
      }
    } catch (e) {
      console.log('error', e);
    }
  };

  const getJobApps = async (getToken, dbId) => {
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

      console.log('data job apps', data);
      setJobApps(data);
    } catch (error) {
      console.error('Failed to fetch job apps:', error);
    }
  };

  const createResume = async (getToken) => {
    const token = await getToken();

    setCurrResume(seedResume);

    try {
      const response = await fetch('/api/users/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currResume,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        console.error('Save failed:', data.message);
        return;
      }

      // add new resume to all resumes
      setAllResumes((prev) => [...prev, data]);

      await getJobApps(getToken, userIds.dbId);

      console.log('Resume saved successfully');
    } catch (error) {
      console.error('Failed to save resume:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        userIds,
        setUserIds,
        resumeFile,
        setResumeFile,
        jobLink,
        setJobLink,
        userPane,
        setUserPane,
        currResume,
        setCurrResume,
        allResumes,
        setAllResumes,
        getResumes,
        getJobApps,
        jobApps,
        setJobApps,
        createResume,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
