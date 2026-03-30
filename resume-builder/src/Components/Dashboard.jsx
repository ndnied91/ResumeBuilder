import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import { JobTable } from './JobTable';
import { useUser, useAuth } from '@clerk/clerk-react';

export const Dashboard = () => {
  const { user } = useUser();
  const { allResumes = [], createResume, jobApps = [] } = useAppContext();
  const { getToken } = useAuth();

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobLink, setJobLink] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const selectedResume = useMemo(() => {
    return allResumes.find(
      (resume) => (resume.resumeId || resume.id) === selectedResumeId,
    );
  }, [allResumes, selectedResumeId]);

  const handleAnalyze = async () => {
    if (!selectedResumeId || !jobLink.trim()) return;

    setIsAnalyzing(true);

    // sample/mock result for now
    setTimeout(() => {
      setAnalysisResult({
        score: 78,
        summary:
          'This resume aligns well with the core frontend requirements, but could be improved with stronger testing, accessibility, and performance-related keywords.',
        matchedKeywords: [
          'React',
          'TypeScript',
          'JavaScript',
          'REST APIs',
          'Responsive Design',
          'Frontend Development',
        ],
        missingKeywords: ['Jest', 'GraphQL', 'Accessibility', 'Performance'],
        suggestions: [
          'Add a bullet mentioning testing experience with Jest or similar frameworks.',
          'Include one or two measurable performance wins, such as faster load times or improved Lighthouse scores.',
          'Call out accessibility work more explicitly using keywords like WCAG, ADA, or a11y.',
        ],
      });

      setIsAnalyzing(false);
    }, 1200);
  };

  const interviewingCount = jobApps.filter(
    (job) => job.status === 'Interviewing',
  ).length;

  const savedJobLinksCount = jobApps.filter((job) => !!job.jobLink).length;

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your resumes, applications, and progress in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Jobs Applied</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {jobApps.length}
            </h2>
            <p className="mt-2 text-sm text-gray-400">Applications submitted</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Unique Resumes</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {allResumes.length}
            </h2>
            <p className="mt-2 text-sm text-gray-400">Saved resume versions</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Interviews</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {interviewingCount}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Interview stages reached
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Saved Job Links</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {savedJobLinksCount}
            </h2>
            <p className="mt-2 text-sm text-gray-400">Tracked opportunities</p>
          </div>
        </div>

        {/* Lower section */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* ATS Checker */}
          <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Resume Match Checker
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Check how well one of your saved resumes aligns with a job
                before applying.
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr_auto]">
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
                    {resume.title || resume.name || 'Untitled Resume'}
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
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                  isAnalyzing || !selectedResumeId || !jobLink.trim()
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {isAnalyzing && (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>

            {/* Selected resume info */}
            {selectedResume && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Selected Resume
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {selectedResume.title ||
                    selectedResume.name ||
                    'Untitled Resume'}
                </p>
              </div>
            )}

            {/* Results / Empty State */}
            {!analysisResult ? (
              <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
                <p className="text-sm text-gray-500">
                  Select a resume and paste a job link to see a sample match
                  score, missing keywords, and improvement suggestions.
                </p>
              </div>
            ) : (
              <>
                {/* Score row */}
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm font-medium text-gray-500">
                      Match Score
                    </p>
                    <h4 className="mt-2 text-4xl font-bold text-gray-900">
                      {analysisResult.score}%
                    </h4>
                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${scoreStyles.badge}`}
                    >
                      {scoreStyles.text}
                    </span>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
                    <p className="text-sm font-medium text-gray-700">Summary</p>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {analysisResult.summary}
                    </p>
                  </div>
                </div>

                {/* Keywords */}
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm font-medium text-gray-700">
                      Matched Keywords
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {analysisResult.matchedKeywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm font-medium text-gray-700">
                      Missing Keywords
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {analysisResult.missingKeywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
                  <p className="text-sm font-medium text-gray-700">
                    Suggestions
                  </p>

                  <ul className="mt-3 space-y-2">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <button className="w-full cursor-pointer rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800">
                Upload Resume
              </button>

              <button
                className="w-full cursor-pointer rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                onClick={() => createResume(getToken)}
              >
                Seed Resume
              </button>
            </div>
          </div>
        </div>

        <JobTable />
      </div>
    </div>
  );
};
