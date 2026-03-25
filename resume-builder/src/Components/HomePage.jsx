import React from 'react';
import {
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/clerk-react';

export const HomePage = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-semibold text-gray-800">Resume Builder</h1>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Build Your Resume Faster
          </h2>

          <p className="text-gray-600 mb-6">
            Upload your resume and match it to any job description using AI.
          </p>

          {/* Signed Out View */}
          <SignedOut>
            <div className="flex justify-center">
              <SignIn
                appearance={{
                  elements: {
                    card: 'shadow-lg',
                  },
                }}
              />
            </div>
          </SignedOut>

          {/* Signed In View */}
          <SignedIn>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-lg text-gray-700 mb-4">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
              </p>

              <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                Get Started
              </button>
            </div>
          </SignedIn>
        </div>
      </main>
    </div>
  );
};
