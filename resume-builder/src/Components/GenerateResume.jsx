import { useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import { mapResumeToState } from '../utils/helper';
import { useUser, useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

export const GenerateResume = () => {
  const { user } = useUser();
  const {
    jobLink,
    setJobLink,
    currResume,
    setCurrResume,
    allResumes,
    userIds,
    setAllResumes,
    setUserPane,
  } = useAppContext();

  const { getToken, isSignedIn } = useAuth();

  const [isGenerating, setIsGenerating] = useState(false);

  const [isApplied, setIsApplied] = useState(true);

  const handleSelectResume = (resumeId) => {
    const found = allResumes.find((r) => r.id === resumeId);
    if (!found) return;

    const mapped = mapResumeToState(found);
    setCurrResume(mapped);
  };

  const generateResume = async () => {
    if (!isSignedIn || !user) return;

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
                      {resume.targetCompany || 'Untitled Resume'}
                    </option>
                  ))}
              </select>
            </div>
          </section>

          {/* Action */}
          <section className="flex justify-end gap-2">
            <button
              onClick={generateResume}
              disabled={isGenerating}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition  ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800 cursor-pointer'
              }`}
            >
              {isGenerating && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin " />
              )}

              {isGenerating ? 'Generating...' : 'Generate Resume'}
            </button>

            <div
              className="px-4 py-2 rounded-lg border flex flex-row items-center gap-2 cursor-pointer"
              onChange={() => setIsApplied((prev) => !prev)}
            >
              <label className="cursor-pointer"> Set job as applied </label>
              <input
                className="cursor-pointer"
                type="checkbox"
                checked={isApplied}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
