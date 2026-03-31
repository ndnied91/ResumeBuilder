import React from 'react';
import { useAppContext } from '../../context/useAppContext';

export const FullATS = () => {
  const {
    allResumes = [],
    setUserPane,
    analysisResult,
    setAnalysisResult,
  } = useAppContext();

  console.log('score', analysisResult);

  return <div>FullATS</div>;
};
