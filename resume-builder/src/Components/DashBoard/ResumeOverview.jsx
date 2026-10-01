import { useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { FaTrashCan } from 'react-icons/fa6';
import { LuPencil } from 'react-icons/lu';

import { useAppContext } from '../../context/useAppContext';
import { useUserContext } from '../../context/user/UserContext';
import { useJobAppsContext } from '../../context/jobApps/JobAppsContext';
import { mapResumeToState } from '../../utils/helper';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/70';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : '-';

const ResumeOverview = () => {
  const { allResumes = [], setAllResumes, setCurrResume } = useAppContext();
  const { setUserPane } = useUserContext();
  const { jobApps = [] } = useJobAppsContext();
  const { getToken } = useAuth();

  const [deletingId, setDeletingId] = useState(null);

  const sortedResumes = useMemo(
    () =>
      [...allResumes].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      ),
    [allResumes],
  );

  const appCountByResume = useMemo(() => {
    const counts = {};
    jobApps.forEach((job) => {
      if (job.resumeId) counts[job.resumeId] = (counts[job.resumeId] || 0) + 1;
    });
    return counts;
  }, [jobApps]);

  const deleteResume = async (id) => {
    const token = await getToken();
    const res = await fetch(`/api/resumes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete resume');
  };

  const handleEdit = (resume) => {
    setCurrResume(mapResumeToState(resume));
    setUserPane('edit');
  };

  const handleDelete = async (resume) => {
    const name = resume.title || resume.targetCompany || 'this resume';
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;

    setDeletingId(resume.id);
    try {
      await deleteResume(resume.id);
      setAllResumes((prev) => prev.filter((r) => r.id !== resume.id));
      toast.success('Resume deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        `Delete all ${allResumes.length} resumes? This cannot be undone.`,
      )
    )
      return;

    setDeletingId('all');
    try {
      await Promise.all(allResumes.map((r) => deleteResume(r.id)));
      setAllResumes([]);
      toast.success('All resumes deleted');
    } catch (err) {
      console.error(err);
      toast.error('Some resumes could not be deleted');
    } finally {
      setDeletingId(null);
    }
  };

  const isBusy = deletingId !== null;

  return (
    <section className="mt-4" aria-labelledby="resumes-heading">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="resumes-heading" className="text-3xl font-bold text-gray-900">
            Current Resumes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View your saved resumes at a glance
          </p>
        </div>

        <button
          type="button"
          onClick={handleDeleteAll}
          disabled={!allResumes.length || isBusy}
          className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-white ${focusRing}`}
        >
          <FaTrashCan size={12} aria-hidden="true" />
          {deletingId === 'all' ? 'Deleting...' : 'Delete all'}
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {sortedResumes.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">
            No resumes yet. Upload one or generate a tailored version to get
            started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Saved resumes</caption>
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Resume
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Created
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Updated
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Job description
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Applications
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sortedResumes.map((resume) => {
                  const name =
                    resume.title || resume.targetCompany || 'Untitled resume';
                  const isDeleting = deletingId === resume.id;

                  return (
                    <tr key={resume.id} className="hover:bg-gray-50">
                      <th
                        scope="row"
                        className="px-4 py-3 font-medium text-gray-900"
                      >
                        {name}
                        {resume.targetCompany &&
                          resume.targetCompany !== name && (
                            <span className="block text-xs font-normal text-gray-500">
                              {resume.targetCompany}
                            </span>
                          )}
                      </th>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(resume.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(resume.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        {resume.jobDescription ? (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            Saved
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {appCountByResume[resume.id] || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(resume)}
                            disabled={isBusy}
                            aria-label={`Edit ${name}`}
                            className={`cursor-pointer rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                          >
                            <LuPencil size={14} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(resume)}
                            disabled={isBusy}
                            aria-label={`Delete ${name}`}
                            className={`cursor-pointer rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                          >
                            {isDeleting ? (
                              <span className="text-xs">...</span>
                            ) : (
                              <FaTrashCan size={14} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResumeOverview;
