import { useMemo, useState } from 'react';
import { UserContext } from './UserContext';

export function UserProvider({ children }) {
  const [userIds, setUserIds] = useState();
  const [userPane, setUserPane] = useState('resumeParser');

  const value = useMemo(
    () => ({ userIds, setUserIds, userPane, setUserPane }),
    [userIds, userPane],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
