import { useState } from 'react';
import { RiMenuFold2Fill, RiMenuFoldFill } from 'react-icons/ri';
import { useClerk } from '@clerk/clerk-react';
import { useUserContext } from '../context/user/UserContext';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/70';

const routes = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'edit', label: 'Current Resumes' },
  { key: 'generate', label: 'Generate Resume' },
  { key: 'ats', label: 'ATS Checker' },
  // { key: 'settings', label: 'Settings' },
  // { key: 'history', label: 'Historical' },
];

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { signOut, user } = useClerk();
  const { setUserPane, userPane } = useUserContext();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/' }); // Redirect to the home page after sign out
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  return (
    <aside
      aria-label="Sidebar"
      className={`flex h-screen shrink-0 flex-col border-r border-gray-200 bg-white motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-in-out ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Top / Toggle */}
      <div className="flex items-center justify-between p-4">
        {isOpen && (
          <p className="text-lg font-semibold text-gray-800">ResumeAI</p>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="sidebar-content"
          aria-label={isOpen ? 'Collapse navigation' : 'Expand navigation'}
          className={`cursor-pointer rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 ${focusRing}`}
        >
          {isOpen ? (
            <RiMenuFoldFill size={24} aria-hidden="true" />
          ) : (
            <RiMenuFold2Fill size={24} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Main Content */}
      {isOpen && (
        <div
          id="sidebar-content"
          className="flex h-full flex-col justify-between"
        >
          {/* Navigation */}
          <nav aria-label="Main" className="px-3 py-2">
            <ul>
              {routes.map((route) => {
                const isActive = route.key === userPane;

                return (
                  <li key={route.key}>
                    <button
                      type="button"
                      onClick={() => setUserPane(route.key)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`mb-1 w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm tracking-wide transition hover:bg-gray-100 hover:text-gray-900 ${focusRing} ${
                        isActive
                          ? 'bg-gray-100 font-extrabold text-gray-900'
                          : 'text-gray-600'
                      }`}
                    >
                      {route.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="mb-3 flex items-center gap-3 rounded-xl p-2">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                {user?.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {fullName || 'Signed in'}
                </p>
                <p className="text-xs text-gray-500">Premium</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className={`h-11 w-full cursor-pointer rounded-lg bg-gray-900 text-sm font-medium text-white transition hover:bg-gray-800 ${focusRing}`}
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
