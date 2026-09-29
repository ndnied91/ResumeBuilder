import { useEffect, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { useJobAppsContext } from '../../context/jobApps/JobAppsContext';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const buttonFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2';

export const AddNoteModal = ({ setShowAddNoteModal, selectedJob }) => {
  const { getToken } = useAuth();
  const { setJobApps } = useJobAppsContext();

  const [jobAppNotes, setJobAppNotes] = useState(selectedJob?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const hasExistingNotes = Boolean(selectedJob?.notes);

  const closeModal = () => {
    if (!isSaving) setShowAddNoteModal(false);
  };

  // Close on Escape (but not mid-save)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSaving) setShowAddNoteModal(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, setShowAddNoteModal]);

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);

    try {
      const token = await getToken();

      const res = await fetch(`/api/job-applications/${selectedJob.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: jobAppNotes }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || 'Failed to update notes');
        return;
      }

      toast.success('Notes updated successfully!', { duration: 2000 });
      setJobApps((prev) =>
        prev.map((job) =>
          job.id === selectedJob.id ? { ...job, ...data } : job,
        ),
      );
      setShowAddNoteModal(false);
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
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeModal}
      />

      <FocusTrap
        focusTrapOptions={{
          escapeDeactivates: false,
          initialFocus: '#job-notes',
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notes-modal-title"
          aria-describedby="notes-modal-description"
          className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
        >
          <div className="mb-5">
            <h2
              id="notes-modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              {hasExistingNotes ? 'Edit Notes' : 'Add Notes'}
            </h2>
            <p
              id="notes-modal-description"
              className="mt-1 text-sm text-gray-500"
            >
              Keep notes for this job application
            </p>
          </div>

          <form onSubmit={handleUpdateJob}>
            <div className="space-y-4">
              {/* Read-only job details */}
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="mb-1 text-sm font-medium text-gray-700">
                    Company
                  </dt>
                  <dd className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {selectedJob?.company || '-'}
                  </dd>
                </div>

                <div>
                  <dt className="mb-1 text-sm font-medium text-gray-700">
                    Job Title
                  </dt>
                  <dd className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {selectedJob?.jobTitle || '-'}
                  </dd>
                </div>
              </dl>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="job-notes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Notes
                  </label>
                  <span id="job-notes-count" className="text-xs text-gray-500">
                    {jobAppNotes.length} characters
                  </span>
                </div>

                <textarea
                  id="job-notes"
                  value={jobAppNotes}
                  onChange={(e) => setJobAppNotes(e.target.value)}
                  rows={6}
                  aria-describedby="job-notes-count"
                  placeholder="Add notes about interviews, recruiter conversations, follow-ups, salary details, or anything else..."
                  className="w-full resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 ${buttonFocus}`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                aria-busy={isSaving}
                className={`cursor-pointer rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 ${buttonFocus}`}
              >
                {isSaving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </form>
        </div>
      </FocusTrap>
    </div>
  );
};
