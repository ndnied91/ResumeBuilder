import { useAppContext } from '../../context/useAppContext';
import { useAuth } from '@clerk/clerk-react';
import { formatResumeForClient } from '../../utils/helper';
import { FaTrashCan } from 'react-icons/fa6';
import { LuPencil } from 'react-icons/lu';
import { FaRegSave } from 'react-icons/fa';
import { useState } from 'react';
import FocusTrap from 'focus-trap-react';
import toast from 'react-hot-toast';
import { IoMdAdd } from 'react-icons/io';
import { AddJobModal } from './AddJobModal';
import { MdOutlineStickyNote2 } from 'react-icons/md';

import { AddNoteModal } from './AddNoteModal';

export const JobTable = () => {
  const {
    jobApps,
    setJobApps,
    allResumes,
    setCurrResume,
    setUserPane,
    currResume,
  } = useAppContext();

  const { getToken } = useAuth();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

      if (res.status === 200) {
        toast.success('Job updated successfully!', {
          duration: 2000,
        });
      } else {
        toast.error(data?.message || 'Failed to delete resume');
      }

      setJobApps((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, ...data } : job)),
      );

      cancelEditingJob();
    } catch (error) {
      console.error('Failed to update job:', error);
    }
  };

  const filteredJobs =
    filter === 'All' ? jobApps : jobApps.filter((job) => job.status === filter);

  const openDeleteModal = (job) => {
    setSelectedJob(job);
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

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    try {
      const token = await getToken();

      const res = await fetch(`/api/job-applications/${selectedJob.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 200) {
        toast.success('Resume deleted successfully!', {
          duration: 2000,
        });
      } else {
        toast.error(data?.message || 'Failed to delete resume');
      }

      setShowDeleteModal(false);
      setJobApps((prev) => prev.filter((job) => job.id !== selectedJob.id));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <section className="mt-4">
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />

          <FocusTrap>
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Job Application
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete this job application? This
                action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteJob}
                  className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
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
            <h2 className="text-3xl font-bold text-gray-900">
              Job Applications
            </h2>

            <button
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-gray-100"
              onClick={() => setShowAddModal(true)}
              title="Add job application"
            >
              <IoMdAdd size={20} />
            </button>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Track where you applied and which resume was used
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {['All', 'Applied', 'Interviewing', 'Rejected', 'Offer'].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out ${
                    filter === item
                      ? 'scale-105 bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:scale-105 hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {jobApps.length}{' '}
          {jobApps.length === 1 ? 'application' : 'applications'}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="max-h-72 overflow-y-auto">
          {jobApps.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No job applications yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Start by adding one or generating a resume
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className=" sticky top-0 z-10 border-b bg-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Company
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Applied
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">Link</th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    View Resume
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Edit
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Delete
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.map((job) => {
                  const isSelectedResume =
                    currResume &&
                    (currResume.resumeId || currResume.id) === job.resumeId;

                  return (
                    <tr
                      key={job.id}
                      className={`border-b last:border-none transition ${
                        isSelectedResume ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Company */}
                      <td className="w-[250px] px-4 py-3">
                        <div className="px-2 py-1">
                          {editingJobId === job.id ? (
                            <input
                              value={editValues.company}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  company: e.target.value,
                                }))
                              }
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                            />
                          ) : (
                            <span className="block font-medium text-gray-800">
                              {job.company}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="w-[250px] px-4 py-3">
                        {editingJobId === job.id ? (
                          <input
                            type="text"
                            value={editValues.jobTitle}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                jobTitle: e.target.value,
                              }))
                            }
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
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
                          className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium outline-none ${
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
                      <td className="px-4 py-3">
                        {resumeExists(job.resumeId) ? (
                          <button
                            onClick={() => viewSelectedResume(job)}
                            className="cursor-pointer text-sm font-medium text-blue-600 transition hover:text-blue-800"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">Deleted</span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openNoteModal(job)}
                          title={job.notes ? 'Edit notes' : 'Add notes'}
                          className="group relative cursor-pointer text-gray-500 transition hover:text-gray-800"
                        >
                          <MdOutlineStickyNote2 size={24} />
                          {job.notes ? (
                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                          ) : null}
                        </button>
                      </td>

                      {/* Edit */}
                      <td className="px-4 py-3 text-center">
                        {editingJobId === job.id ? (
                          <button
                            onClick={() => saveEditedJob(job.id)}
                            className="cursor-pointer text-gray-500 transition hover:text-gray-800"
                            title="Save changes"
                          >
                            <FaRegSave size={20} />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditingJob(job)}
                            className="cursor-pointer text-gray-500 transition hover:text-gray-800"
                            title="Edit job"
                          >
                            <LuPencil size={20} />
                          </button>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openDeleteModal(job)}
                          className="cursor-pointer text-red-500 transition hover:text-red-700"
                          title="Delete job"
                        >
                          <FaTrashCan size={20} />
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
