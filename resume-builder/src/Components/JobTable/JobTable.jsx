import { useAppContext } from '../../context/useAppContext';
import { useUserContext } from '../../context/user/UserContext';
import { useJobAppsContext } from '../../context/jobApps/JobAppsContext';

import { useAuth } from '@clerk/clerk-react';
import { formatResumeForClient } from '../../utils/helper';
import { FaTrashCan } from 'react-icons/fa6';
import { LuPencil } from 'react-icons/lu';
import { FaRegSave } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdAdd } from 'react-icons/io';
import { AddJobModal } from './AddJobModal';
import { MdOutlineStickyNote2 } from 'react-icons/md';

import { AddNoteModal } from './AddNoteModal';
import DeleteJobModal from './DeleteJobModal';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/70';

const STATUSES = ['All', 'Applied', 'Interviewing', 'Rejected', 'Offer'];

export const JobTable = () => {
  const { allResumes, setCurrResume, currResume } = useAppContext();
  const { jobApps, setJobApps } = useJobAppsContext();
  const { setUserPane } = useUserContext();
  const { getToken } = useAuth();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState('single'); // 'single' | 'all'
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('Applied');
  const [editingJobId, setEditingJobId] = useState(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');
  const [editValues, setEditValues] = useState({
    company: '',
    jobTitle: '',
  });

  const startEditingJob = (job) => {
    setEditingJobId(job.id);
    setEditValues({
      company: job.company || '',
      jobTitle: job.jobTitle || '',
    });
  };

  const cancelEditingJob = () => {
    setEditingJobId(null);
    setEditValues({
      company: '',
      jobTitle: '',
    });
  };

  const saveEditedJob = async (jobId) => {
    try {
      const token = await getToken();

      const res = await fetch(`/api/job-applications/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: editValues.company,
          jobTitle: editValues.jobTitle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || 'Failed to update job');
        return;
      }

      toast.success('Job updated successfully!', { duration: 2000 });
      setJobApps((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, ...data } : job)),
      );
      cancelEditingJob();
    } catch (error) {
      console.error('Failed to update job:', error);
      toast.error('Failed to update job');
    }
  };

  // Enter saves, Escape cancels while editing a row
  const handleEditKeyDown = (e, jobId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditedJob(jobId);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingJob();
    }
  };

  const filteredJobs =
    filter === 'All' ? jobApps : jobApps.filter((job) => job.status === filter);

  const openDeleteModal = (job) => {
    setSelectedJob(job);
    setDeleteMode('single');
    setShowDeleteModal(true);
  };

  const openDeleteAllModal = () => {
    setDeleteMode('all');
    setShowDeleteModal(true);
  };

  const openNoteModal = (job) => {
    setSelectedJob(job);
    setShowAddNoteModal(true);
  };

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const token = await getToken();

      const res = await fetch(`/api/job-applications/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data?.message || 'Failed to update status');
        return;
      }

      setJobApps((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: data.status } : job,
        ),
      );
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const viewSelectedResume = (job) => {
    const found = allResumes.find(
      (element) => (element.resumeId || element.id) === job.resumeId,
    );

    if (found) {
      setCurrResume(formatResumeForClient(found));
      setUserPane('resumeParser');
    } else {
      console.log('unable to view this resume');
    }
  };

  const resumeExists = (resumeId) => {
    if (!resumeId) return false;

    return allResumes.some(
      (resume) => (resume.resumeId || resume.id) === resumeId,
    );
  };

  return (
    <section className="mt-4" aria-labelledby="job-apps-heading">
      {/* Delete Modal (single or all) */}
      {showDeleteModal && (
        <DeleteJobModal
          selectedJob={selectedJob}
          setShowDeleteModal={setShowDeleteModal}
          isDeleteAll={deleteMode === 'all'}
        />
      )}

      {/* Add new job modal */}
      {showAddModal && <AddJobModal setShowAddModal={setShowAddModal} />}

      {/* Add note modal */}
      {showAddNoteModal && (
        <AddNoteModal
          setShowAddNoteModal={setShowAddNoteModal}
          selectedJob={selectedJob}
        />
      )}

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="job-apps-heading"
              className="text-3xl font-bold text-gray-900"
            >
              Job Applications
            </h2>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              aria-label="Add job application"
              title="Add job application"
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-gray-100 ${focusRing}`}
            >
              <IoMdAdd size={20} aria-hidden="true" />
            </button>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Track where you applied and which resume was used
          </p>

          <div
            role="group"
            aria-label="Filter by status"
            className="mt-4 flex flex-wrap gap-2"
          >
            {STATUSES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out ${focusRing} ${
                  filter === item
                    ? 'bg-gray-900 text-white shadow-sm motion-safe:scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 motion-safe:hover:scale-105 motion-safe:active:scale-95'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {jobApps.length}{' '}
            {jobApps.length === 1 ? 'application' : 'applications'}
          </div>

          <button
            type="button"
            onClick={openDeleteAllModal}
            disabled={jobApps.length === 0}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-white ${focusRing}`}
          >
            <FaTrashCan size={12} aria-hidden="true" />
            Delete all
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="max-h-72 overflow-y-auto">
          {jobApps.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No job applications yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Start by adding one or generating a resume
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Job applications, filtered by{' '}
                {filter === 'All' ? 'all statuses' : filter}
              </caption>

              <thead className="sticky top-0 z-10 border-b bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-gray-600"
                  >
                    Company
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-gray-600"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-gray-600"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-gray-600"
                  >
                    Applied
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-gray-600"
                  >
                    Link
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-gray-600"
                  >
                    View Resume
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center font-medium text-gray-600"
                  >
                    Notes
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center font-medium text-gray-600"
                  >
                    Edit
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center font-medium text-gray-600"
                  >
                    Delete
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No applications with status “{filter}”
                    </td>
                  </tr>
                )}

                {filteredJobs.map((job) => {
                  const isSelectedResume =
                    currResume &&
                    (currResume.resumeId || currResume.id) === job.resumeId;
                  const isEditing = editingJobId === job.id;
                  const jobName = `${job.company || 'job'}${job.jobTitle ? `, ${job.jobTitle}` : ''}`;

                  return (
                    <tr
                      key={job.id}
                      className={`border-b last:border-none transition ${
                        isSelectedResume ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Company */}
                      <td className="w-62.5 px-4 py-3">
                        <div className="px-2 py-1">
                          {isEditing ? (
                            <input
                              value={editValues.company}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  company: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => handleEditKeyDown(e, job.id)}
                              aria-label="Company"
                              autoFocus
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                            />
                          ) : (
                            <span className="block font-medium text-gray-800">
                              {job.company}
                              {isSelectedResume && (
                                <span className="sr-only">
                                  {' '}
                                  (uses current resume)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="w-62.5 px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.jobTitle}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                jobTitle: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => handleEditKeyDown(e, job.id)}
                            aria-label="Role"
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                          />
                        ) : (
                          <span className="block w-full text-gray-700">
                            {job.jobTitle}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <select
                          value={job.status}
                          onChange={(e) =>
                            updateJobStatus(job.id, e.target.value)
                          }
                          aria-label={`Status for ${jobName}`}
                          className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium ${focusRing} ${
                            job.status === 'Applied'
                              ? 'border-gray-200 bg-gray-100 text-gray-700'
                              : job.status === 'Interviewing'
                                ? 'border-blue-200 bg-blue-100 text-blue-700'
                                : job.status === 'Rejected'
                                  ? 'border-red-200 bg-red-100 text-red-700'
                                  : 'border-green-200 bg-green-100 text-green-700'
                          }`}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Offer">Offer</option>
                        </select>
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
                            aria-label={`View job posting for ${jobName} (opens in a new tab)`}
                            className={`inline-flex items-center gap-1 rounded text-blue-600 transition hover:underline ${focusRing}`}
                          >
                            <span>View</span>
                            <span className="text-xs" aria-hidden="true">
                              ↗
                            </span>
                          </a>
                        ) : (
                          <span className="text-gray-500">
                            <span aria-hidden="true">-</span>
                            <span className="sr-only">No link</span>
                          </span>
                        )}
                      </td>

                      {/* View Resume */}
                      <td className="px-4 py-3">
                        {resumeExists(job.resumeId) ? (
                          <button
                            type="button"
                            onClick={() => viewSelectedResume(job)}
                            aria-label={`View resume used for ${jobName}`}
                            className={`cursor-pointer rounded text-sm font-medium text-blue-600 transition hover:text-blue-800 ${focusRing}`}
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">Deleted</span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openNoteModal(job)}
                          aria-label={
                            job.notes
                              ? `Edit notes for ${jobName}`
                              : `Add notes for ${jobName}`
                          }
                          title={job.notes ? 'Edit notes' : 'Add notes'}
                          className={`group relative cursor-pointer rounded text-gray-500 transition hover:text-gray-800 ${focusRing}`}
                        >
                          <MdOutlineStickyNote2 size={24} aria-hidden="true" />
                          {job.notes ? (
                            <span
                              aria-hidden="true"
                              className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500"
                            />
                          ) : null}
                        </button>
                      </td>

                      {/* Edit */}
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => saveEditedJob(job.id)}
                            aria-label={`Save changes to ${jobName}`}
                            title="Save changes"
                            className={`cursor-pointer rounded text-gray-500 transition hover:text-gray-800 ${focusRing}`}
                          >
                            <FaRegSave size={20} aria-hidden="true" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditingJob(job)}
                            aria-label={`Edit ${jobName}`}
                            title="Edit job"
                            className={`cursor-pointer rounded text-gray-500 transition hover:text-gray-800 ${focusRing}`}
                          >
                            <LuPencil size={20} aria-hidden="true" />
                          </button>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openDeleteModal(job)}
                          aria-label={`Delete ${jobName}`}
                          title="Delete job"
                          className={`cursor-pointer rounded text-red-600 transition hover:text-red-700 ${focusRing}`}
                        >
                          <FaTrashCan size={20} aria-hidden="true" />
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
    </section>
  );
};
