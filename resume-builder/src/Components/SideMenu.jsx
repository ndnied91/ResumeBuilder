import React, { useContext, useState } from 'react';
import { RiMenuFold2Fill, RiMenuFoldFill } from 'react-icons/ri';
import { useAppContext } from '../context/useAppContext';

import { useClerk } from '@clerk/clerk-react';

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, user } = useClerk();

  const { setUserPane } = useAppContext();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/' }); // Redirect to the home page after sign out
  };

  const routes = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'resume', label: 'Resume' },
    { key: 'generate', label: 'Generate Resume' },
    { key: 'ats', label: 'ATS Checker' },
    { key: 'settings', label: 'Settings' },
  ];

  const renderRoutes = () => {
    return routes.map((route) => (
      <button
        key={route.key}
        onClick={() => setUserPane(route.key)}
        className="mb-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
      >
        {route.label}
      </button>
    ));
  };

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Top / Toggle */}
      <div className="flex items-center justify-between p-4">
        {isOpen && (
          <h2 className="text-lg font-semibold text-gray-800">ResumeAI</h2>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="cursor-pointer rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
        >
          {isOpen ? (
            <RiMenuFoldFill size={24} />
          ) : (
            <RiMenuFold2Fill size={24} />
          )}
        </button>
      </div>

      {/* Main Content */}
      {isOpen && (
        <div className="flex h-full flex-col justify-between">
          {/* Navigation */}
          <nav className="px-3 py-2">{renderRoutes()}</nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="mb-3 flex items-center gap-3 rounded-xl p-2 transition ">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                <img
                  src={user.imageUrl}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">Premium</p>
              </div>
            </div>

            <button
              className="h-11 w-full rounded-lg bg-gray-900 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SideMenu;
