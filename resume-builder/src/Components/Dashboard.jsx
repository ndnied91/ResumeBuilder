import { useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import { useJobAppsContext } from '../context/jobApps/JobAppsContext';

import { JobTable } from './JobTable/JobTable';
import { useUser, useAuth } from '@clerk/clerk-react';
import { seedResume } from '../utils/helper';
import { UploadModal } from './UploadModal';
import { FiUploadCloud, FiDatabase, FiChevronRight } from 'react-icons/fi';

const QuickAction = ({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'secondary',
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
  >
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        variant === 'primary'
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-700'
      }`}
    >
      <Icon size={16} />
    </span>

    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium text-gray-900">{title}</span>
      <span className="block truncate text-xs text-gray-500">
        {description}
      </span>
    </span>

    <FiChevronRight
      size={16}
      aria-hidden="true"
      className="shrink-0 text-gray-400 transition motion-safe:group-hover:translate-x-0.5 group-hover:text-gray-600"
    />
  </button>
);

const StatCard = ({ label, value, caption }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-3xl font-bold text-gray-900">{value}</dd>
    <dd className="mt-2 text-sm text-gray-500">{caption}</dd>
  </div>
);

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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Stats */}
          <section aria-labelledby="overview-heading" className="contents">
            <h2 id="overview-heading" className="sr-only">
              Overview
            </h2>
            <dl className="contents">
              <StatCard
                label="Jobs Applied"
                value={jobApps.length}
                caption="Applications submitted"
              />
              <StatCard
                label="Resumes"
                value={allResumes.length}
                caption="Saved resume versions"
              />
              <StatCard
                label="Interviews"
                value={interviewingCount}
                caption="Interview stages reached"
              />
            </dl>
          </section>

          {/* Quick Tasks */}
          <section
            aria-labelledby="quick-tasks-heading"
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <h2
              id="quick-tasks-heading"
              className="mb-3 px-1 text-sm font-medium text-gray-500"
            >
              Quick Tasks
            </h2>

            <div className="space-y-2">
              <QuickAction
                icon={FiUploadCloud}
                title="Upload resume"
                description="Add a PDF or Word file"
                variant="primary"
                onClick={() => setIsUploadModal(true)}
              />

              {import.meta.env.DEV && (
                <QuickAction
                  icon={FiDatabase}
                  title="Seed resume"
                  description="Load sample data"
                  onClick={handleSeedResume}
                />
              )}
            </div>
          </section>
        </div>

        {isUploadModal && <UploadModal setIsUploadModal={setIsUploadModal} />}

        <JobTable />
      </div>
    </div>
  );
};
