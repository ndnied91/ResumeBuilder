import SideMenu from './SideMenu';
import { useAppContext } from '../context/useAppContext';
import { useUserContext } from '../context/user/UserContext';
import { useJobAppsContext } from '../context/jobApps/JobAppsContext';

import { GenerateResume } from './GenerateResume';
import { Settings } from './Settings';
import { useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { HomePage } from './HomePage';
import { useUser, useAuth, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { AtsInsights } from './ATS/AtsInsights';

import { History } from './History';

import { ResumeParser } from './Resume/ResumeParser/';

function App() {
  const { getResumes } = useAppContext();
  const { userPane, setUserIds, userIds } = useUserContext();
  const { getJobApps } = useJobAppsContext();

  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const init = async () => {
      if (!isSignedIn || !user) return;

      // 1. sync user
      const userRes = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
        }),
      });

      const userData = await userRes.json();
      setUserIds({ clerk: userData.clerkId, dbId: userData.id });
      await getResumes(getToken);
    };

    init();
  }, [isSignedIn, user]);

  //used for getting job apps after user has been authenticated
  useEffect(() => {
    if (!userIds?.dbId) return;

    const fetchData = async () => {
      await getJobApps(getToken, userIds.dbId);
    };

    fetchData();
  }, [userIds?.dbId]);

  const panes = {
    generate: <GenerateResume />,
    settings: <Settings />,
    dashboard: <Dashboard />,
    ats: <AtsInsights />,
    history: <History />,
    edit: <ResumeParser />,
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#111827', // dark (Tailwind gray-900)
            color: '#fff',
            padding: '16px 20px',
            fontSize: '14px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          },
        }}
      />
      <section className="min-h-screen bg-white">
        <SignedOut>
          <HomePage />
        </SignedOut>

        <SignedIn>
          <div className="flex min-h-screen bg-gray-100 text-black">
            <SideMenu />

            <main className="flex-1 ">
              <div className="mx-auto">
                {panes[userPane] || <GenerateResume />}
              </div>
            </main>
          </div>
        </SignedIn>
      </section>
    </>
  );
}

export default App;
