import { useEffect, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { useAppContext } from '../../context/useAppContext';
import { useJobAppsContext } from '../../context/jobApps/JobAppsContext';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const inputClass =
  'w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20';

const buttonFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2';

export const AddJobModal = ({ setShowAddModal }) => {
  const { allResumes } = useAppContext();
  const { setJobApps } = useJobAppsContext();
  const { getToken } = useAuth();

  const [jobApp, setJobApp] = useState({
    company: '',
    jobTitle: '',
    status: 'Applied',
    jobLink: '',
    resumeId: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const canSave =
    !isSaving && jobApp.company.trim() !== '' && jobApp.jobTitle.trim() !== '';

  const updateField = (field, value) => {
    setJobApp((prev) => ({ ...prev, [field]: value }));
  };

  const closeModal = () => {
    if (!isSaving) setShowAddModal(false);
  };

  // Close on Escape (but not mid-save)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSaving) setShowAddModal(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, setShowAddModal]);

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    setIsSaving(true);
    setError('');

    try {
      const token = await getToken();

      const response = await fetch('/api/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobApp),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Failed to save job application.');
        return;
      }

      setJobApps((prev) => [...prev, data]);
      toast.success('Job application saved', { duration: 2000 });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding job:', err);
      setError('Failed to save job application.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeModal}
      />

      <FocusTrap focusTrapOptions={{ escapeDeactivates: false }}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-job-title"
          aria-describedby="add-job-description"
          className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-4">
            <h2
              id="add-job-title"
              className="text-xl font-semibold text-gray-900"
            >
              Add Job Application
            </h2>
            <p id="add-job-description" className="mt-1 text-sm text-gray-500">
              Track a new job you're applying to
            </p>
          </div>

          <form onSubmit={handleAddJob} noValidate>
            <div className="space-y-4">
              {/* Company */}
              <div>
                <label
                  htmlFor="add-job-company"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Company <span className="text-gray-500">(required)</span>
                </label>
                <input
                  id="add-job-company"
                  type="text"
                  value={jobApp.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  required
                  aria-required="true"
                  autoComplete="organization"
                  className={inputClass}
                />
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="add-job-role"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Role <span className="text-gray-500">(required)</span>
                </label>
                <input
                  id="add-job-role"
                  type="text"
                  value={jobApp.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  required
                  aria-required="true"
                  autoComplete="organization-title"
                  className={inputClass}
                />
              </div>

              {/* Link */}
              <div>
                <label
                  htmlFor="add-job-link"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Job Link{' '}
                  <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <input
                  id="add-job-link"
                  type="url"
                  inputMode="url"
                  value={jobApp.jobLink}
                  onChange={(e) => updateField('jobLink', e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              {/* Resume */}
              <div>
                <label
                  htmlFor="add-job-resume"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Resume{' '}
                  <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <select
                  id="add-job-resume"
                  value={jobApp.resumeId}
                  onChange={(e) => updateField('resumeId', e.target.value)}
                  className={inputClass}
                >
                  <option value="">No resume</option>
                  {Array.isArray(allResumes) &&
                    allResumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.targetCompany || 'Untitled Resume'}
                      </option>
                    ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="add-job-status"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="add-job-status"
                  value={jobApp.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className={inputClass}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Offer">Offer</option>
                </select>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className={`cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${buttonFocus}`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSave}
                aria-busy={isSaving}
                className={`cursor-pointer rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 ${buttonFocus}`}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </FocusTrap>
    </div>
  );
};
