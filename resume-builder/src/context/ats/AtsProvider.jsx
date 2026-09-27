import { useCallback, useMemo, useState } from 'react';
import { AtsContext } from './AtsContext';

export function AtsProvider({ children }) {
  const [analysisResult, setAnalysisResult] = useState({});
  const [selectedResumeId_ATS, setSelectedResumeId_ATS] = useState('');
  const [jobLink_ATS, setJobLink_ATS] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = useCallback(
    async (getToken) => {
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
    },
    [selectedResumeId_ATS, jobLink_ATS],
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
    }),
    [
      analysisResult,
      selectedResumeId_ATS,
      jobLink_ATS,
      isAnalyzing,
      handleAnalyze,
    ],
  );

  return <AtsContext.Provider value={value}>{children}</AtsContext.Provider>;
}
