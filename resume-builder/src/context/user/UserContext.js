import { createContext, useContext } from 'react';

export const UserContext = createContext(null);

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserContext must be used inside <UserProvider>');
  }
  return ctx;
};
