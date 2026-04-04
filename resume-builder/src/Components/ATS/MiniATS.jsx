import { useState } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { getScoreStyles } from './helper';

export const MiniATS = () => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const {
    allResumes = [],
    setUserPane,
    analysisResult,
    setAnalysisResult,
    selectedResumeId_ATS,
    setSelectedResumeId_ATS,
    jobLink_ATS,
    setJobLink_ATS,
    handleAnalyze,
    isAnalyzing,
  } = useAppContext();

  const scoreStyles = analysisResult
    ? getScoreStyles(analysisResult?.result?.score)
    : null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Mini ATS Check
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Quick score before you open the full checker.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAnalysisResult({})}
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Check resume
          </button>

          <button
            onClick={() => setUserPane('ats')}
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Full ATS Checker
          </button>
        </div>
      </div>

      {!analysisResult.result && (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[180px_1fr_auto]">
          <select
            value={selectedResumeId_ATS}
            onChange={(e) => setSelectedResumeId_ATS(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
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

          <input
            type="text"
            value={jobLink_ATS}
            onChange={(e) => setJobLink_ATS(e.target.value)}
            placeholder="Paste job link here"
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />

          <button
            onClick={() => handleAnalyze(getToken)}
            disabled={
              isAnalyzing || !selectedResumeId_ATS || !jobLink_ATS.trim()
            }
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition cursor-pointer ${
              isAnalyzing || !selectedResumeId_ATS || !jobLink_ATS.trim()
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      )}

      {analysisResult.result && scoreStyles && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-base font-semibold text-gray-900 shadow-sm">
              {analysisResult?.result?.score}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">
                Overall ATS Score
              </p>
              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${scoreStyles.badge}`}
              >
                {scoreStyles.text}
              </span>
            </div>
          </div>

          <button
            onClick={() => setUserPane('ats')}
            className="text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900"
          >
            View full breakdown
          </button>
        </div>
      )}
    </section>
  );
};
