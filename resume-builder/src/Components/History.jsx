// import React, { useMemo, useState } from 'react';
// import { useAppContext } from '../context/useAppContext';
// import { FaRegNoteSticky } from 'react-icons/fa6';

// export const History = ({
//   openNoteModal,
//   viewSelectedResume,
//   resumeExists,
// }) => {
//   const { jobApps, currResume, allResumes } = useAppContext();
//   const [historyFilter, setHistoryFilter] = useState('All');

//   const historicalJobs = useMemo(() => {
//     return jobApps.filter(
//       (job) => job.status === 'Rejected' || job.status === 'Withdrawn',
//     );
//   }, [jobApps]);

//   const filteredHistory = useMemo(() => {
//     if (historyFilter === 'All') return historicalJobs;
//     return historicalJobs.filter((job) => job.status === historyFilter);
//   }, [historicalJobs, historyFilter]);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="mx-auto max-w-6xl">
//         <div className="mb-4">
//           <h1 className="mt-1 text-3xl font-bold text-gray-900">
//             Historical Tracker
//           </h1>
//           <p className="mt-2 text-sm text-gray-600">
//             Track your current and past applications.
//           </p>
//         </div>

//         <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
//           <div className="xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import { FaRegNoteSticky } from 'react-icons/fa6';

export const History = () => {
  const { jobApps, currResume } = useAppContext();
  const [historyFilter, setHistoryFilter] = useState('All');

  const historicalJobs = useMemo(() => {
    return jobApps.filter(
      (job) => job.status === 'Rejected' || job.status === 'Withdrawn',
    );
  }, [jobApps]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'All') return historicalJobs;
    return historicalJobs.filter((job) => job.status === historyFilter);
  }, [historicalJobs, historyFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-4">
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Historical Tracker
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View past applications and keep track of roles that are no longer
            active.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Top row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Application History
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Rejected or withdrawn applications are stored here for future
                  reference.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {['All', 'Rejected', 'Withdrawn'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setHistoryFilter(item)}
                      className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out ${
                        historyFilter === item
                          ? 'scale-105 bg-gray-900 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:scale-105 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {filteredHistory.length}{' '}
                {filteredHistory.length === 1 ? 'application' : 'applications'}
              </div>
            </div>

            {/* Table / Empty State */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="max-h-[500px] overflow-y-auto">
                {filteredHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl">
                      🗂️
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">
                      No history yet
                    </h3>
                    <p className="mt-2 max-w-md text-sm text-gray-500">
                      Applications marked as rejected or withdrawn will appear
                      here so you can still reference them later.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-600">
                          Company
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-600">
                          Role
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-600">
                          Status
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-600">
                          Applied
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-600">
                          Link
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-600">
                          View Resume
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">
                          Notes
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredHistory.map((job) => {
                        const isSelectedResume =
                          currResume &&
                          (currResume.resumeId || currResume.id) ===
                            job.resumeId;

                        return (
                          <tr
                            key={job.id}
                            className={`border-b last:border-none transition ${
                              isSelectedResume
                                ? 'bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {/* Company */}
                            <td className="px-4 py-3">
                              <span className="font-medium text-gray-800">
                                {job.company}
                              </span>
                            </td>

                            {/* Role */}
                            <td className="px-4 py-3 text-gray-700">
                              {job.jobTitle}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                                  job.status === 'Rejected'
                                    ? 'border-red-200 bg-red-100 text-red-700'
                                    : 'border-gray-200 bg-gray-100 text-gray-700'
                                }`}
                              >
                                {job.status}
                              </span>
                            </td>

                            {/* Applied Date */}
                            <td className="px-4 py-3 text-gray-600">
                              {job.dateApplied
                                ? new Date(job.dateApplied).toLocaleDateString()
                                : '-'}
                            </td>

                            {/* Link */}
                            <td className="px-4 py-3">
                              {job.jobLink ? (
                                <a
                                  href={job.jobLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 transition hover:underline"
                                >
                                  <span>View</span>
                                  <span className="text-xs">↗</span>
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>

                            {/* View Resume */}

                            {/* Notes */}
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openNoteModal(job)}
                                title={
                                  job.notes
                                    ? job.notes.length > 100
                                      ? `${job.notes.slice(0, 100)}...`
                                      : job.notes
                                    : 'Add notes'
                                }
                                className="relative cursor-pointer text-gray-500 transition hover:text-gray-800"
                              >
                                <FaRegNoteSticky size={18} />
                                {job.notes ? (
                                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                                ) : null}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
