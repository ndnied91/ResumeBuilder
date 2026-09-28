import { useCallback, useMemo, useState } from 'react';
import { AtsContext } from './AtsContext';

export function AtsProvider({ children }) {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedResumeId_ATS, setSelectedResumeId_ATS] = useState('');
  const [jobLink_ATS, setJobLink_ATS] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobDescription_ATS, setJobDescription_ATS] = useState('');

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
        console.log(data);

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
    },
    [selectedResumeId_ATS],
  );

  const value = useMemo(
    () => ({
      analysisResult,
      setAnalysisResult,
      selectedResumeId_ATS,
      setSelectedResumeId_ATS,
      jobLink_ATS,
      setJobLink_ATS,
      isAnalyzing,
      setIsAnalyzing,
      handleAnalyze,
      jobDescription_ATS,
      setJobDescription_ATS,
    }),
    [
      analysisResult,
      selectedResumeId_ATS,
      jobLink_ATS,
      isAnalyzing,
      handleAnalyze,
      jobDescription_ATS,
    ],
  );

  return <AtsContext.Provider value={value}>{children}</AtsContext.Provider>;
}
