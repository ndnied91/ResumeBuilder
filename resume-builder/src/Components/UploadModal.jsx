import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import FocusTrap from 'focus-trap-react';
import { useAppContext } from '../context/useAppContext';
import { FiUploadCloud, FiFileText, FiLink, FiTag } from 'react-icons/fi';
import { mapResumeToState } from '../utils/helper';

export const UploadModal = ({ setIsUploadModal }) => {
  const { setCurrResume, setAllResumes, setUserPane } = useAppContext();
  const { getToken } = useAuth();

  const [resumeFile, setResumeFile] = useState(null);
  const [jobLink, setJobLink] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
  };

  const handleSave = async () => {
    if (!resumeFile) return;

    try {
      setIsSaving(true);

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
        console.error('Upload failed:', data.message);
        return;
      }

      setCurrResume(mapResumeToState(data));
      setAllResumes((prev) => [...prev, data]);
      setIsUploadModal(false);
      setUserPane('resume');
    } catch (error) {
      console.error('Failed to upload resume:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsUploadModal(false)}
      />

      <FocusTrap>
        <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white">
                <FiUploadCloud size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Upload Resume
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add a PDF, DOC, or DOCX file and we’ll save it into your
                  resume library.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiFileText size={16} />
                Resume File
              </label>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-gray-700 file:shadow-sm hover:file:bg-gray-100"
              />

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

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiTag size={16} />
                Resume Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Resume"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiLink size={16} />
                Job Link
              </label>
              <input
                type="text"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button
              onClick={() => setIsUploadModal(false)}
              className="cursor-pointer rounded-2xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !resumeFile}
              className="cursor-pointer rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
            >
              {isSaving ? 'Uploading...' : 'Save Resume'}
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};
