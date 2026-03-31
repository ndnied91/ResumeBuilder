import React, { useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { useAppContext } from '../../context/useAppContext';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

export const AddJobModal = ({ setShowAddModal }) => {
  const { setJobApps, allResumes } = useAppContext();
  const { getToken } = useAuth();

  const [jobApp, setJobApp] = useState({
    company: '',
    jobTitle: '',
    status: 'Applied',
    jobLink: '',
    resumeId: '',
  });

  const updateField = (field, value) => {
    setJobApp((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddJob = async () => {
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
        console.error('Failed to save job:', data.message);
        return null;
      }

      setJobApp({
        company: '',
        jobTitle: '',
        status: 'Applied',
        jobLink: '',
        resumeId: '',
      });

      setShowAddModal(false);

      setJobApps((prev) => [...prev, data]);

      toast.success('Saved job app successfully!', {
        duration: 2000,
      });

      return data;
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error(data?.message || 'Failed to save job app');
      return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowAddModal(false)}
      />

      <FocusTrap>
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Job Application
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track a new job you're applying to
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Company */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Company
              </label>
              <input
                type="text"
                value={jobApp.company}
                onChange={(e) => updateField('company', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* jobTitle */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                type="text"
                value={jobApp.jobTitle || ''}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Link */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Job Link
              </label>
              <input
                type="text"
                value={jobApp.jobLink || ''}
                onChange={(e) => updateField('jobLink', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Resume Select */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Resume
              </label>
              <select
                value={jobApp?.resumeId || ''}
                onChange={(e) => updateField('resumeId', e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="" disabled>
                  Select a resume
                </option>

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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={jobApp.status || 'Applied'}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Rejected">Rejected</option>
                <option value="Offer">Offer</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleAddJob} // changed from delete → add
              className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-black cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};
