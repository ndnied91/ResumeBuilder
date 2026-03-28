import React from 'react';
import { useAppContext } from '../context/useAppContext';

export const JobTable = () => {
  const { allResumes } = useAppContext();

  console.log(allResumes);
  return <div>JobTable</div>;
};
