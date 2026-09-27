import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AppProvider } from '../context/AppProvider.jsx';
import { UserProvider } from '../context/user/UserProvider.jsx';
import { JobAppsProvider } from '../context/jobApps/JobAppsProvider.jsx';
import { AtsProvider } from '../context/ats/AtsProvider.jsx';
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <UserProvider>
        <JobAppsProvider>
          <AppProvider>
            <AtsProvider>
              <App />
            </AtsProvider>
          </AppProvider>
        </JobAppsProvider>
      </UserProvider>
    </ClerkProvider>
  </StrictMode>,
);
