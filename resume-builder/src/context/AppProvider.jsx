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
  const [analysisResult, setAnalysisResult] = useState({});
  const [selectedResumeId_ATS, setSelectedResumeId_ATS] = useState(''); //only for ATS
  const [jobLink_ATS, setJobLink_ATS] = useState(
    'https://job-boards.greenhouse.io/justworks/jobs/7733611?gh_jid=7733611&gh_src=f08327d91us&source=LinkedIn',
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false); //for ats route

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

      if (data.length || []) {
        setAllResumes(data);
        const resume = data[0]; // take first resume for now
        const mapped = mapResumeToState(resume);
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

      setJobApps(data);
    } catch (error) {
      console.error('Failed to fetch job apps:', error);
    }
  };

  // const createResume = async (getToken, seed = false) => {
  const createResume = async (getToken, resumeOverride = null) => {
    const token = await getToken();

    const resumeToSave = resumeOverride || currResume;
    console.log('curr resume actually being used', resumeToSave);

    try {
      const response = await fetch('/api/users/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currResume: resumeToSave,
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
  };

  const handleAnalyze = async (getToken) => {
    if (!selectedResumeId_ATS || !jobLink_ATS.trim()) return;

    try {
      setIsAnalyzing(true);

      const token = await getToken();
      const res = await fetch('/api/ats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedResumeId_ATS,
          jobLink_ATS,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('ATS analysis failed:', data.message);
        return;
      }

      setAnalysisResult(data);
    } catch (error) {
      console.error('Error analyzing resume:', error);
    } finally {
      setIsAnalyzing(false);
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
        analysisResult,
        setAnalysisResult,
        selectedResumeId_ATS,
        setSelectedResumeId_ATS,
        jobLink_ATS,
        setJobLink_ATS,
        handleAnalyze,
        isAnalyzing,
        setIsAnalyzing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
