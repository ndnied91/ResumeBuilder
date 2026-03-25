import React from 'react';
import { useAppContext } from '../context/useAppContext';
import { mapResumeToState } from '../utils/helper';

export const GenerateResume = () => {
  const { jobLink, setJobLink, currResume, setCurrResume, allResumes } =
    useAppContext();

  const handleSelectResume = (resumeId) => {
    const found = allResumes.find((r) => r.id === resumeId);
    if (!found) return;

    const mapped = mapResumeToState(found);
    setCurrResume(mapped);
  };

  const generateResume = () => {
    //api call to backend to generate AI Call
    console.log('selected resume is', currResume);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-500">Resume Builder</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Generate Resume
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Paste a job link and create a tailored version of your resume.
            </p>
          </div>

          {/* Input Section */}
          <section className="mb-8">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Job Link
            </label>
            <input
              type="text"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="Paste job link here"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </section>

          {/* Content Cards */}
          <section className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">Job Link</p>
              <p className="mt-3 break-words text-sm text-gray-700">
                {jobLink || 'No job link added yet.'}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">Resume File</p>

              <select
                value={currResume?.resumeId || ''}
                onChange={(e) => handleSelectResume(e.target.value)}
                className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="" disabled>
                  Select a resume
                </option>

                {Array.isArray(allResumes) &&
                  allResumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title || 'Untitled Resume'}
                    </option>
                  ))}
              </select>
            </div>
          </section>

          {/* Action */}
          <section className="flex justify-end">
            <button
              className="h-11 rounded-lg bg-gray-900 px-6 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
              onClick={generateResume}
            >
              Generate Resume
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
