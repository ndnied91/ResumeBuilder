import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAppContext } from '../../context/useAppContext';
import { useAtsContext } from '../../context/ats/AtsContext';

import AtsResults from './AtsResults';

export const AtsInsights = () => {
  const { allResumes = [] } = useAppContext();

  const {
    selectedResumeId_ATS,
    setSelectedResumeId_ATS,
    handleAnalyze,
    isAnalyzing,
    jobDescription_ATS,
    setJobDescription_ATS,
    setAnalysisResult,
  } = useAtsContext();

  const { getToken } = useAuth();

  const [jdSource, setJdSource] = useState('saved'); // 'saved' | 'custom'

  const selectedResume = allResumes.find(
    (r) => (r.resumeId || r.id) === selectedResumeId_ATS,
  );
  const savedDescription = selectedResume?.jobDescription || '';

  // Fall back to custom when the selected resume has no saved description
  const source = savedDescription ? jdSource : 'custom';
  const descriptionToUse =
    source === 'saved' ? savedDescription : jobDescription_ATS;

  const canAnalyze =
    !isAnalyzing &&
    !!selectedResumeId_ATS &&
    descriptionToUse.trim().length > 0;

  return (
    <section className="space-y-6 p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">ATS Checker</h2>
          <p className="mt-1 text-sm text-gray-500">
            Analyze how well your resume matches a job posting and get clear,
            actionable suggestions.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2 sm:w-72">
              <label
                htmlFor="atsResume"
                className="text-sm font-medium text-gray-700"
              >
                Resume
              </label>
              <select
                id="atsResume"
                value={selectedResumeId_ATS}
                onChange={(e) => {
                  setSelectedResumeId_ATS(e.target.value);
                  setAnalysisResult(null);
                }}
                className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              >
                <option value="">Select Resume</option>
                {allResumes.map((resume) => (
                  <option
                    key={resume.resumeId || resume.id}
                    value={resume.resumeId || resume.id}
                  >
                    {resume.targetCompany || resume.name || 'Untitled Resume'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setJdSource('saved')}
                disabled={!savedDescription}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:text-gray-300 ${
                  source === 'saved'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'cursor-pointer text-gray-500 hover:text-gray-700'
                }`}
              >
                Saved description
              </button>
              <button
                type="button"
                onClick={() => setJdSource('custom')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  source === 'custom'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'cursor-pointer text-gray-500 hover:text-gray-700'
                }`}
              >
                Custom description
              </button>
            </div>
          </div>

          {/* Job description */}
          {source === 'saved' ? (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Job description this resume was generated for
              </p>
              <div className="max-h-48 overflow-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                {savedDescription}
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="atsDescription"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Job description
              </label>
              <textarea
                id="atsDescription"
                rows={8}
                value={jobDescription_ATS}
                onChange={(e) => setJobDescription_ATS(e.target.value)}
                placeholder="Paste the full job description to check this resume against"
                className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
              {selectedResumeId_ATS && !savedDescription && (
                <p className="mt-2 text-xs text-gray-500">
                  This resume doesn't have a saved job description, so paste one
                  here.
                </p>
              )}
            </div>
          )}

          {/* Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleAnalyze(getToken, descriptionToUse)}
              disabled={!canAnalyze}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
            >
              {isAnalyzing && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Run ATS Check'}
            </button>
          </div>
        </div>
      </div>

      <AtsResults descriptionToUse={descriptionToUse} />
    </section>
  );
};
