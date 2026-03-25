import { useState, useEffect } from 'react';
import { AppContext } from './app-context';
import { mapResumeToState, blankResume } from '../utils/helper';
import { useUser } from '@clerk/clerk-react';

export function AppProvider({ children }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobLink, setJobLink] = useState('');
  const [userPane, setUserPane] = useState('dashboard');
  // const [isSignedIn, setIsSignedIn] = useState(true);
  const [userIds, setUserIds] = useState();
  const [allResumes, setAllResumes] = useState([]);
  const [currResume, setCurrResume] = useState(blankResume);

  const { user, isSignedIn } = useUser();

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
        console.log('mapped:', mapped);

        setCurrResume(mapped);
      }
    } catch (e) {
      console.log('error', e);
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
        // isSignedIn,
        // setIsSignedIn,
        currResume,
        setCurrResume,
        allResumes,
        setAllResumes,
        getResumes, // 👈 expose it
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
