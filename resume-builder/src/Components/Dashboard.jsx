import React, { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useAppContext } from '../context/useAppContext';
import { seedResume } from '../utils/helper';

export const Dashboard = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { currResume, setUserIds, allResumes, setAllResumes, setCurrResume } =
    useAppContext();

  const handleSaveResume = async () => {
    setCurrResume(seedResume);
    try {
      const response = await fetch('/api/users/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          currResume,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        console.error('Save failed:', data.message);
        return;
      }

      // add new resume to all resumes
      setAllResumes((prev) => [...prev, data]);

      console.log('Resume saved successfully');
    } catch (error) {
      console.error('Failed to save resume:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your resumes, applications, and progress in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Jobs Applied</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">0</h2>
            <p className="mt-2 text-sm text-gray-400">Applications submitted</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Unique Resumes</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {allResumes ? allResumes.length : 0}
            </h2>
            <p className="mt-2 text-sm text-gray-400">Saved resume versions</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Interviews</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">0</h2>
            <p className="mt-2 text-sm text-gray-400">
              Interview stages reached
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Saved Job Links</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">0</h2>
            <p className="mt-2 text-sm text-gray-400">Tracked opportunities</p>
          </div>
        </div>

        {/* Lower section */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Recent Activity */}
          <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
            </div>

            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-500">
                No activity yet. Once you start uploading resumes or saving job
                links, they’ll show up here.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <button className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer">
                Upload Resume
              </button>

              <button className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer">
                Generate Resume
              </button>

              <button className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer">
                Add Job Link
              </button>

              <div className="flex gap-3">
                <button
                  className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
                  onClick={handleSaveResume}
                >
                  Seed Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
