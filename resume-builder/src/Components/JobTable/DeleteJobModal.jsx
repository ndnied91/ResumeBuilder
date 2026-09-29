import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import FocusTrap from 'focus-trap-react';
import toast from 'react-hot-toast';

import { useJobAppsContext } from '../../context/jobApps/JobAppsContext';

const DeleteJobModal = ({ selectedJob, setShowDeleteModal, isDeleteAll }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const { jobApps, setJobApps } = useJobAppsContext();
  const { getToken } = useAuth();

  // Close on Escape (but not mid-delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) setShowDeleteModal(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDeleting, setShowDeleteModal]);

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    setIsDeleting(true);

    try {
      const token = await getToken();

      const res = await fetch(`/api/job-applications/${selectedJob.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || 'Failed to delete job application');
        return;
      }

      toast.success('Job application deleted', { duration: 2000 });
      setJobApps((prev) => prev.filter((job) => job.id !== selectedJob.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job application');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllJobs = async () => {
    setIsDeleting(true);

    try {
      const token = await getToken();

      const res = await fetch('/api/job-applications', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || 'Failed to delete job applications');
        return;
      }

      toast.success(
        `Deleted ${data.count} ${data.count === 1 ? 'application' : 'applications'}`,
        { duration: 2000 },
      );
      setJobApps([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting all jobs:', error);
      toast.error('Failed to delete job applications');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isDeleting && setShowDeleteModal(false)}
      />

      <FocusTrap focusTrapOptions={{ escapeDeactivates: false }}>
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            {isDeleteAll
              ? 'Delete All Job Applications'
              : 'Delete Job Application'}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {isDeleteAll
              ? `Are you sure you want to delete all ${jobApps.length} job applications? This action cannot be undone.`
              : 'Are you sure you want to delete this job application? This action cannot be undone.'}
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={isDeleteAll ? handleDeleteAllJobs : handleDeleteJob}
              disabled={isDeleting}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isDeleting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isDeleting
                ? 'Deleting...'
                : isDeleteAll
                  ? 'Delete All'
                  : 'Delete'}
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

export default DeleteJobModal;
