import { useMemo } from 'react';
import { useAtsContext } from '../../context/ats/AtsContext';
import { getScoreStyles } from './helper';

const AtsResults = () => {
  const { analysisResult } = useAtsContext();

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

  if (!normalizedResult) return null;

  const score = Number(normalizedResult.score ?? 0);
  const scoreStyles = getScoreStyles(score);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  return (
    <section className="px-6 pb-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
        {/* LEFT PANEL */}
        <div className="h-max rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>

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

          <div className="mt-5 max-h-[calc(75vh-350px)] overflow-y-auto rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">Summary</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {normalizedResult.summary || 'No summary returned.'}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="max-h-[75vh] space-y-6 overflow-y-auto pr-1">
          {/* Strengths */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>

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
  );
};

export default AtsResults;
