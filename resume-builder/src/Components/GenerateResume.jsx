import { useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import { useUserContext } from '../context/user/UserContext';
import { mapResumeToState } from '../utils/helper';
import { useUser, useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

export const GenerateResume = () => {
  const { user } = useUser();
  const {
    jobLink,
    setJobLink,
    jobDescription,
    setJobDescription,
    currResume,
    setCurrResume,
    allResumes,
    setAllResumes,
    resumeTitle,
    setResumeTitle,
  } = useAppContext();

  const { userIds, setUserPane } = useUserContext();

  const { getToken, isSignedIn } = useAuth();

  const [isGenerating, setIsGenerating] = useState(false);

  const [isApplied, setIsApplied] = useState(true);

  const canGenerate = !isGenerating && jobDescription.trim().length > 0;

  const handleSelectResume = (resumeId) => {
    const found = allResumes.find((r) => r.id === resumeId);
    if (!found) return;

    const mapped = mapResumeToState(found);
    setCurrResume(mapped);
  };

  const generateResume = async () => {
    if (!isSignedIn || !user || !canGenerate) return;

    setIsGenerating(true);

    try {
      const token = await getToken();

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userIds.dbId,
          currResume,
          jobLink,
          resumeTitle, //not added yet
          jobDescription,
          isApplied, //set job in application
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.message || 'Failed to generate resume');
        return;
      }

      setCurrResume(mapResumeToState(data));
      setAllResumes((prev) => [...prev, data]);

      toast.success('Resume generated successfully!', {
        duration: 2000,
      });

      setJobDescription('');
      setUserPane('resumeParser'); //brings user to new resume
    } catch (error) {
      console.error('Failed to generate resume:', error);
      toast.error('Failed to generate resume');
    } finally {
      setIsGenerating(false);
    }
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
            <label
              htmlFor="jobLink"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Job Link
            </label>
            <input
              id="jobLink"
              type="text"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="Paste job link here"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />

            <label
              htmlFor="jobDescription"
              className="mt-6 mb-2 block text-sm font-medium text-gray-700"
            >
              Job Description
            </label>
            <textarea
              id="jobDescription"
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here"
              className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </section>

          {/* Content Cards */}
          <section className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 hidden">
              <p className="text-sm font-medium text-gray-500">Resume Title</p>
              <p className="wrap-break-word text-sm text-gray-700">
                <input
                  type="text"
                  value={resumeTitle}
                  placeholder="Add resume title"
                  className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  onChange={(e) => setResumeTitle(e.target.value)}
                />
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">Base Resume</p>

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
                      {resume.targetCompany || 'Untitled Resume'}
                    </option>
                  ))}
              </select>
            </div>
          </section>

          {/* Action */}
          <section className="flex items-center justify-end gap-3">
            <label
              className={`flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition ${
                isGenerating
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isApplied}
                onChange={(e) => setIsApplied(e.target.checked)}
                disabled={isGenerating}
                className="h-4 w-4 cursor-pointer accent-gray-900 disabled:cursor-not-allowed"
              />
              Mark as applied
            </label>

            <button
              type="button"
              onClick={generateResume}
              disabled={!canGenerate}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
            >
              {isGenerating && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Resume'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
