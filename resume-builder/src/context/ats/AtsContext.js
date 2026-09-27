import { createContext, useContext } from 'react';

export const AtsContext = createContext(null);

export const useAtsContext = () => {
  const ctx = useContext(AtsContext);
  if (!ctx) {
    throw new Error('useAtsContext must be used inside <AtsProvider>');
  }
  return ctx;
};
