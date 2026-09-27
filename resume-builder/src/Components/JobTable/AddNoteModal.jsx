import React, { useState } from 'react';
import FocusTrap from 'focus-trap-react';
// import { useAppContext } from '../../context/useAppContext';
import { useJobAppsContext } from '../../context/jobApps/JobAppsContext';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

export const AddNoteModal = ({ setShowAddNoteModal, selectedJob }) => {
  const { getToken } = useAuth();
  // const { setJobApps } = useAppContext();
  const { setJobApps } = useJobAppsContext();

  const [jobAppNotes, setJobAppNotes] = useState(selectedJob?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateJob = async () => {
    try {
      setIsSaving(true);

      const token = await getToken();

      const res = await fetch(`/api/job-applications/${selectedJob.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: jobAppNotes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Notes updated successfully!', {
          duration: 2000,
        });

        // update global state
        setJobApps((prev) =>
          prev.map((job) =>
            job.id === selectedJob.id ? { ...job, ...data } : job,
          ),
        );

        setShowAddNoteModal(false);
      } else {
        toast.error(data?.message || 'Failed to update notes');
      }
    } catch (error) {
      console.error('Failed to update notes:', error);
      toast.error('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowAddNoteModal(false)}
      />

      <FocusTrap>
        <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">Add Notes</h2>
            <p className="mt-1 text-sm text-gray-500">
              Keep notes for this job application
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Company
              </label>
              <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {selectedJob?.company || '-'}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {selectedJob?.jobTitle || '-'}
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <span className="text-xs text-gray-400">
                  {jobAppNotes.length} characters
                </span>
              </div>

              <textarea
                value={jobAppNotes}
                onChange={(e) => setJobAppNotes(e.target.value)}
                rows={6}
                placeholder="Add notes about interviews, recruiter conversations, follow-ups, salary details, or anything else..."
                className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowAddNoteModal(false)}
              className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdateJob}
              disabled={isSaving}
              className="cursor-pointer rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};
