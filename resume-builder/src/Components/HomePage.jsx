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
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white shadow-sm">
              RB
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-gray-900">
                Resume Builder
              </h1>
              <p className="text-sm text-gray-500">
                Tailor resumes faster with AI
              </p>
            </div>
          </div>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-12 lg:py-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left Side */}
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 shadow-sm">
              Built for faster job applications
            </div>

            <h2 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
              Build a stronger resume without starting from scratch
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              Upload your resume, tailor it to specific roles, and generate
              cleaner, more targeted content with AI so you can spend less time
              formatting and more time applying.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">
                  Tailored Content
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Match your resume to each job posting.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">
                  Cleaner Workflow
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Edit and manage resumes in one place.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">
                  AI Assistance
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Generate better phrasing faster.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex w-full justify-center lg:justify-end">
            <SignedOut>
              <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-xl shadow-gray-200/60 backdrop-blur">
                <div className="mb-4 px-2">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Get started
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Sign in to create, edit, and tailor your resumes.
                  </p>
                </div>
                <div className="flex justify-center w-full">
                  <SignIn
                    appearance={{
                      elements: {
                        rootBox: 'w-full',
                        card: 'w-full max-w-none shadow-none border-0 rounded-2xl px-0',
                        form: 'w-full',
                        formFieldRow: 'w-full',
                        headerTitle: 'text-gray-900',
                        headerSubtitle: 'text-gray-500',
                        socialButtonsBlockButton:
                          'w-full rounded-xl border border-gray-200 shadow-none hover:bg-gray-50',
                        formButtonPrimary:
                          'w-full bg-black hover:bg-gray-800 text-white rounded-xl',
                        formFieldInput:
                          'w-full rounded-xl border border-gray-300 focus:border-black focus:ring-black',
                        footerActionLink: 'text-gray-900 hover:text-gray-700',
                      },
                    }}
                  />
                </div>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/60">
                <p className="text-sm font-medium text-gray-500">
                  Welcome back
                </p>
                <h3 className="mt-2 text-3xl font-semibold text-gray-900">
                  {user?.firstName
                    ? `Hi, ${user.firstName}`
                    : 'Ready to build?'}
                </h3>
                <p className="mt-3 text-gray-600">
                  Jump back in and continue refining your resume for your next
                  opportunity.
                </p>

                <button className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer">
                  Get Started
                </button>
              </div>
            </SignedIn>
          </div>
        </div>
      </main>
    </div>
  );
};
