import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import FocusTrap from 'focus-trap-react';
import { useAppContext } from '../../context/useAppContext';

import { useUserContext } from '../../context/user/UserContext';

import { FiUploadCloud, FiFileText, FiLink, FiTag } from 'react-icons/fi';
import { mapResumeToState } from '../../utils/helper';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2';

export const UploadModal = ({ setIsUploadModal }) => {
  const { setCurrResume, setAllResumes } = useAppContext();
  const { setUserPane } = useUserContext();

  const { getToken } = useAuth();

  const [resumeFile, setResumeFile] = useState(null);
  const [jobLink, setJobLink] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const closeModal = () => {
    if (!isSaving) setIsUploadModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
    setError('');
  };

  const handleSave = async () => {
    if (!resumeFile) return;

    setIsSaving(true);
    setError('');

    try {
      const token = await getToken();
      const formData = new FormData();

      formData.append('resumeFile', resumeFile);
      formData.append('jobLink', jobLink);
      formData.append('title', title);

      const response = await fetch('/api/users/resumes/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Upload failed. Please try again.');
        return;
      }

      setCurrResume(mapResumeToState(data));
      setAllResumes((prev) => [...prev, data]);
      setIsUploadModal(false);
      setUserPane('resume');
    } catch (err) {
      console.error('Failed to upload resume:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Close on Escape (but not mid-upload)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSaving) setIsUploadModal(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, setIsUploadModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeModal}
      />

      <FocusTrap focusTrapOptions={{ escapeDeactivates: false }}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
          aria-describedby="upload-modal-description"
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
        >
          <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-5">
            <div className="flex items-start gap-4">
              <div
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white"
              >
                <FiUploadCloud size={20} />
              </div>

              <div>
                <h2
                  id="upload-modal-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  Upload Resume
                </h2>
                <p
                  id="upload-modal-description"
                  className="mt-1 text-sm text-gray-500"
                >
                  Add a PDF, DOC, or DOCX file and we’ll save it into your
                  resume library.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <label
                htmlFor="upload-resume-file"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <FiFileText size={16} aria-hidden="true" />
                Resume File
              </label>

              <input
                id="upload-resume-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                aria-describedby="upload-file-status"
                required
                className={`block w-full rounded-xl text-sm text-gray-700 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-gray-700 file:shadow-sm hover:file:bg-gray-100 ${focusRing}`}
              />

              <div id="upload-file-status" aria-live="polite">
                {resumeFile ? (
                  <div className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {resumeFile.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Ready to upload
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-500">
                    Supported formats: PDF, DOC, DOCX
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="upload-resume-title"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <FiTag size={16} aria-hidden="true" />
                Resume Title{' '}
                <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <input
                id="upload-resume-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Resume"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
              />
            </div>

            <div>
              <label
                htmlFor="upload-job-link"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <FiLink size={16} aria-hidden="true" />
                Job Link{' '}
                <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <input
                id="upload-job-link"
                type="url"
                inputMode="url"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
              />
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

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className={`cursor-pointer rounded-2xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !resumeFile}
              aria-busy={isSaving}
              className={`cursor-pointer rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 ${focusRing}`}
            >
              {isSaving ? 'Uploading...' : 'Save Resume'}
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};
