import React, { useState } from 'react';
import { useAppContext } from '../../context/useAppContext';

export const MiniATS = () => {
  const {
    allResumes = [],
    setUserPane,
    analysisResult,
    setAnalysisResult,
  } = useAppContext();

  const [jobLink, setJobLink] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const getScoreStyles = (score) => {
    if (score >= 80) {
      return {
        badge: 'bg-green-100 text-green-700',
        text: 'Strong match',
      };
    }

    if (score >= 60) {
      return {
        badge: 'bg-yellow-100 text-yellow-700',
        text: 'Decent match',
      };
    }

    return {
      badge: 'bg-red-100 text-red-700',
      text: 'Needs improvement',
    };
  };

  const scoreStyles = analysisResult
    ? getScoreStyles(analysisResult.score)
    : null;

  const handleAnalyze = async () => {
    if (!selectedResumeId || !jobLink.trim()) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      setAnalysisResult({
        score: 78,
      });

      setIsAnalyzing(false);
    }, 1000);
  };

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
            onClick={() => setAnalysisResult(null)}
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

      {!analysisResult && (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[180px_1fr_auto]">
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
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
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
            placeholder="Paste job link here"
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedResumeId || !jobLink.trim()}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
              isAnalyzing || !selectedResumeId || !jobLink.trim()
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      )}

      {analysisResult && scoreStyles && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-base font-semibold text-gray-900 shadow-sm">
              {analysisResult.score}
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
