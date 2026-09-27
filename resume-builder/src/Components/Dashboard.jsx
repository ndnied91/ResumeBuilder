import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import { useJobAppsContext } from '../context/jobApps/JobAppsContext';

import { JobTable } from './JobTable/JobTable';
import { useUser, useAuth } from '@clerk/clerk-react';
import { seedResume } from '../utils/helper';
import { MiniATS } from './ATS/MiniATS';
import { UploadModal } from './UploadModal';

export const Dashboard = () => {
  const { user } = useUser();
  const { allResumes = [], createResume, setCurrResume } = useAppContext();

  const { jobApps = [] } = useJobAppsContext();

  const { getToken } = useAuth();

  const [isUploadModal, setIsUploadModal] = useState(false);

  const handleSeedResume = async () => {
    setCurrResume(seedResume);
    await createResume(getToken, seedResume, false);
  };

  const interviewingCount = jobApps.filter(
    (job) => job.status === 'Interviewing',
  ).length;

  const savedJobLinksCount = jobApps.filter((job) => !!job.jobLink).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-4">
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your resumes, applications, and progress in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ">
            <p className="text-sm font-medium text-gray-500">Jobs Applied</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              {jobApps.length}
            </h2>
            <p className="mt-2 text-sm text-gray-400">Applications submitted</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Resumes</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              {allResumes.length}
            </h2>
            <p className="mt-2 text-sm text-gray-400">Saved resume versions</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Interviews</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              {interviewingCount}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Interview stages reached
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Saved Job Links</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              {savedJobLinksCount}
            </h2>
            <p className="mt-2 text-sm text-gray-400">Tracked opportunities</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* ATS Checker */}
          <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <MiniATS />
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>

            <div className="space-y-3" onClick={() => setIsUploadModal(true)}>
              <button className="w-full cursor-pointer rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800">
                Upload Resume
              </button>

              <button
                className="w-full cursor-pointer rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                onClick={() => handleSeedResume()}
              >
                Seed Resume
              </button>
            </div>
          </div>
        </div>

        {isUploadModal && <UploadModal setIsUploadModal={setIsUploadModal} />}

        <JobTable />
      </div>
    </div>
  );
};
