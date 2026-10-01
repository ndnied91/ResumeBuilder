import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AtsContext } from './AtsContext';
import { useAppContext } from '../useAppContext';
import { useUserContext } from '../user/UserContext';
import { mapResumeToState } from '../../utils/helper';

export function AtsProvider({ children }) {
  const { setAllResumes, setCurrResume } = useAppContext();
  const { setUserPane } = useUserContext();

  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedResumeId_ATS, setSelectedResumeId_ATS] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobDescription_ATS, setJobDescription_ATS] = useState('');
  const [isRevising, setIsRevising] = useState(false);

  const handleAnalyze = useCallback(
    async (getToken, jobDescription) => {
      if (!selectedResumeId_ATS || !jobDescription?.trim()) return;

      setIsAnalyzing(true);

      try {
        const token = await getToken();
        const res = await fetch('/api/ats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            selectedResumeId_ATS,
            jobDescription,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          console.error('ATS analysis failed:', data.message);
          toast.error(
            data?.message || 'ATS analysis failed. Please try again.',
          );
          return;
        }

        setAnalysisResult(data);
      } catch (error) {
        console.error('Error analyzing resume:', error);
        toast.error('ATS analysis failed. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    },
    [selectedResumeId_ATS],
  );

  const reviseResume = useCallback(
    async (getToken, recommendations, jobDescription) => {
      if (!selectedResumeId_ATS || !recommendations?.length) return null;

      setIsRevising(true);

      try {
        const token = await getToken();

        const response = await fetch(`/api/ats/${selectedResumeId_ATS}/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recommendations, jobDescription }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(
            data?.message || 'Failed to apply suggestions. Please try again.',
          );
          return null;
        }

        setAllResumes((prev) => [...prev, data]);
        setCurrResume(mapResumeToState(data));
        setSelectedResumeId_ATS(data.id);
        setAnalysisResult(null);
        setUserPane('edit');
        toast.success('Suggestions applied! Review your updated resume.', {
          duration: 3000,
        });
        return data;
      } catch (err) {
        console.error('Failed to apply suggestions:', err);
        toast.error('Failed to apply suggestions. Please try again.');
        return null;
      } finally {
        setIsRevising(false);
      }
    },
    [selectedResumeId_ATS, setAllResumes, setCurrResume, setUserPane],
  );

  const value = useMemo(
    () => ({
      analysisResult,
      setAnalysisResult,
      selectedResumeId_ATS,
      setSelectedResumeId_ATS,
      jobDescription_ATS,
      setJobDescription_ATS,
      isAnalyzing,
      setIsAnalyzing,
      handleAnalyze,
      isRevising,
      reviseResume,
    }),
    [
      analysisResult,
      selectedResumeId_ATS,
      jobDescription_ATS,
      isAnalyzing,
      handleAnalyze,
      isRevising,
      reviseResume,
    ],
  );

  return <AtsContext.Provider value={value}>{children}</AtsContext.Provider>;
}
