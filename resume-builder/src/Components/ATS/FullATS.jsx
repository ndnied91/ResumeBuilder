import React, { useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAppContext } from '../../context/useAppContext';
import { getScoreStyles } from './helper';
import { mapResumeToState } from '../../utils/helper';

export const FullATS = () => {
  const {
    allResumes = [],
    analysisResult,
    selectedResumeId_ATS,
    setSelectedResumeId_ATS,
    jobLink_ATS,
    setJobLink_ATS,
    handleAnalyze,
    isAnalyzing,
    setUserPane,
    setCurrResume,
    setAllResumes,
  } = useAppContext();

  const [isImproving, setIsImproving] = useState(false);

  const { getToken } = useAuth();

  const normalizedResult = useMemo(() => {
    if (!analysisResult) return null;

    try {
      if (typeof analysisResult === 'string') {
        return JSON.parse(analysisResult);
      }

      if (analysisResult.result && typeof analysisResult.result === 'string') {
        return JSON.parse(analysisResult.result);
      }

      if (analysisResult.result && typeof analysisResult.result === 'object') {
        return analysisResult.result;
      }

      return analysisResult;
    } catch (error) {
      console.error('Failed to normalize ATS result:', error);
      return null;
    }
  }, [analysisResult]);

  const score = Number(normalizedResult?.score ?? 0);
  const scoreStyles = getScoreStyles(score);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  const handleSubmit = async () => {
    try {
      setIsImproving(true);

      const token = await getToken();

      const res = await fetch('/api/ai/ats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysisResult,
          jobLink: jobLink_ATS,
        }),
      });

      const data = await res.json();

      setCurrResume(mapResumeToState(data));

      setUserPane('resume');
      setAllResumes((prev) => [...prev, data]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Top Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">ATS Checker</h2>
          <p className="mt-1 text-sm text-gray-500">
            Analyze how well your resume matches a job posting and get clear,
            actionable suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[240px_1fr_auto]">
          {/* Select Resume */}
          <select
            value={selectedResumeId_ATS}
            onChange={(e) => setSelectedResumeId_ATS(e.target.value)}
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

          {/* Job Link */}
          <input
            type="text"
            value={jobLink_ATS}
            onChange={(e) => setJobLink_ATS(e.target.value)}
            placeholder="Paste job link here"
            className="h-11 rounded-xl border border-gray-300 px-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />

          {/* Button */}
          <button
            onClick={() => handleAnalyze(getToken)}
            disabled={
              isAnalyzing || !selectedResumeId_ATS || !jobLink_ATS.trim()
            }
            className={`flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-white transition ${
              isAnalyzing || !selectedResumeId_ATS || !jobLink_ATS.trim()
                ? 'cursor-not-allowed bg-gray-400'
                : 'cursor-pointer bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {isAnalyzing && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Run ATS Check'}
          </button>
        </div>
      </div>

      {/* RESULTS / EMPTY STATE */}
      {analysisResult.resume && normalizedResult ? (
        <section className="px-2">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr] ">
            {/* LEFT PANEL */}
            <div className="h-max rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Overall Score
              </h3>

              <div className="mt-4 flex flex-col items-center">
                <div className="relative flex h-36 w-36 items-center justify-center">
                  <svg className="h-36 w-36 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      strokeWidth="8"
                      fill="none"
                      className="stroke-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={progress}
                      className={scoreStyles.ring}
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {score}
                    </span>
                    <span className="text-xs text-gray-500">out of 100</span>
                  </div>
                </div>

                <span
                  className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${scoreStyles.badge}`}
                >
                  {scoreStyles.text}
                </span>
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-4 max-h-[calc(75vh-350px)]  overflow-y-auto">
                <p className="text-sm font-medium text-gray-900">Summary</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {normalizedResult.summary || 'No summary returned.'}
                </p>
              </div>

              <button
                disabled={isImproving}
                onClick={handleSubmit}
                className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-medium text-white transition ${
                  isImproving
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'cursor-pointer bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {isImproving ? 'Generating...' : 'Regenerate with suggestions'}
              </button>
            </div>

            {/* RIGHT PANEL */}
            <div className="max-h-[75vh] overflow-y-auto space-y-6 pr-1">
              {/* Strengths */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">
                  Strengths
                </h3>

                {normalizedResult.strengths?.length ? (
                  <ul className="mt-4 space-y-3">
                    {normalizedResult.strengths.map((item, index) => (
                      <li
                        key={index}
                        className="rounded-xl bg-green-50 px-4 py-3 text-sm text-gray-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    No strengths were returned.
                  </p>
                )}
              </div>

              {/* Gaps */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Gaps</h3>

                {normalizedResult.gaps?.length ? (
                  <ul className="mt-4 space-y-3">
                    {normalizedResult.gaps.map((item, index) => (
                      <li
                        key={index}
                        className="rounded-xl bg-red-50 px-4 py-3 text-sm text-gray-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    No gaps were returned.
                  </p>
                )}
              </div>

              {/* Recommendations */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recommendations
                </h3>

                {normalizedResult.recommendations?.length ? (
                  <ol className="mt-4 space-y-3">
                    {normalizedResult.recommendations.map((item, index) => (
                      <li
                        key={index}
                        className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-gray-700"
                      >
                        <span className="mr-2 font-semibold text-gray-900">
                          {index + 1}.
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    No recommendations were returned.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* EMPTY STATE */
        <section className="px-2">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl">
              📊
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No ATS Results Yet
            </h3>

            <p className="mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
              Select a resume and paste a job link above, then run the ATS check
              to see how well your resume matches the job.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
              <span className="rounded-full bg-gray-100 px-3 py-1">
                Select Resume
              </span>
              <span>→</span>
              <span className="rounded-full bg-gray-100 px-3 py-1">
                Add Job Link
              </span>
              <span>→</span>
              <span className="rounded-full bg-gray-900 px-3 py-1 text-white">
                Run Check
              </span>
            </div>
          </div>
        </section>
      )}
    </section>
  );
};
