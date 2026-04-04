import { useState } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { useUser, useAuth } from '@clerk/clerk-react';
import { FaTrashCan } from 'react-icons/fa6';
import { LuSaveAll } from 'react-icons/lu';
import { FaMinus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import FocusTrap from 'focus-trap-react';

import { blankResume, mapResumeToState } from '../../utils/helper';
import { Input } from './Input';

export const EditResume = () => {
  const {
    currResume,
    setCurrResume,
    userIds,
    allResumes,
    setAllResumes,
    createResume,
  } = useAppContext();

  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();

  const [isSaving, isSetSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const updateField = (field, value) => {
    setCurrResume((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateExperienceField = (jobIndex, field, value) => {
    setCurrResume((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[jobIndex] = {
        ...updatedExperience[jobIndex],
        [field]: value,
      };

      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const updateSkillCategory = (index, value) => {
    const updatedSkills = [...currResume.skills];
    updatedSkills[index].category = value;
    setCurrResume({ ...currResume, skills: updatedSkills });
  };

  const updateSkillItems = (index, value) => {
    const updatedSkills = [...currResume.skills];
    updatedSkills[index].items = value.split(',').map((item) => item.trim());
    setCurrResume({ ...currResume, skills: updatedSkills });
  };

  const updateBullet = (jobIndex, bulletIndex, value) => {
    setCurrResume((prev) => {
      const updatedExperience = [...prev.experience];
      const updatedBullets = [...updatedExperience[jobIndex].bullets];
      updatedBullets[bulletIndex] = value;

      updatedExperience[jobIndex] = {
        ...updatedExperience[jobIndex],
        bullets: updatedBullets,
      };

      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const addBullet = (jobIndex) => {
    setCurrResume((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[jobIndex] = {
        ...updatedExperience[jobIndex],
        bullets: [...updatedExperience[jobIndex].bullets, 'New bullet point'],
      };

      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const removeBullet = (jobIndex, bulletIndex) => {
    setCurrResume((prev) => {
      const updatedExperience = [...prev.experience];
      const updatedBullets = updatedExperience[jobIndex].bullets.filter(
        (_, index) => index !== bulletIndex,
      );

      updatedExperience[jobIndex] = {
        ...updatedExperience[jobIndex],
        bullets: updatedBullets,
      };

      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const addSkill = () => {
    setCurrResume((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          name: '',
          items: [],
        },
      ],
    }));
  };

  const removeSkill = (indexToRemove) => {
    setCurrResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== indexToRemove),
    }));
  };

  const addExperience = () => {
    setCurrResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: 'New Company',
          role: 'New Role',
          date: '2024 - Present',
          bullets: ['Describe your impact here.'],
        },
      ],
    }));
  };

  const deleteResume = async () => {
    if (!isSignedIn || !user || !currResume) return;
    setShowModal(false);

    try {
      const token = await getToken();

      const res = await fetch(
        `/api/users/${userIds.dbId}/resumes/${currResume.resumeId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (res.status === 200) {
        toast.success('Resume deleted successfully!', {
          duration: 2000,
        });
      } else {
        toast.error(data?.message || 'Failed to delete resume');
      }

      const updatedResumes = allResumes.filter(
        (resume) => resume.id !== currResume.resumeId,
      );

      setAllResumes(updatedResumes);

      if (updatedResumes.length > 0) {
        const nextResume = updatedResumes[0];
        const mapped = mapResumeToState(nextResume);
        setCurrResume(mapped);
      } else {
        setCurrResume(blankResume);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const updateResume = async () => {
    if (!isSignedIn || !user) return;

    isSetSaving(true);
    const token = await getToken(); // from Clerk
    const res = await fetch(
      `/api/users/${userIds.dbId}/resumes/${currResume.resumeId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ THIS is what matters
        },
        body: JSON.stringify(currResume),
      },
    );

    const data = await res.json();
    isSetSaving(false);

    if (res.status === 200) {
      toast.success('Resume saved successfully!', {
        duration: 2000,
      });
    } else {
      toast.error(data?.message || 'Failed to save resume');
    }

    setAllResumes((prev) =>
      prev.map((resume) => (resume.id === data.id ? data : resume)),
    );

    isSetSaving(false);
    return data;
  };

  return (
    <div className="min-h-0 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          {/* Modal */}
          import FocusTrap from 'focus-trap-react';
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

              <FocusTrap>
                <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delete Resume
                  </h2>

                  <p className="mt-2 text-sm text-gray-600">
                    Are you sure you want to delete this resume? This action
                    cannot be undone.
                  </p>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={deleteResume}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </FocusTrap>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex justify-between">
        <h2 className="text-sm font-medium text-gray-500 mb-2">Edit Resume</h2>

        <div className="flex gap-6">
          <button
            type="button"
            onClick={
              currResume.resumeId !== null
                ? updateResume
                : () => createResume(getToken)
            }
            disabled={isSaving}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition ${
              isSaving
                ? 'cursor-not-allowed bg-gray-400 text-white opacity-70'
                : 'cursor-pointer bg-gray-900 text-white hover:bg-black'
            }`}
          >
            {isSaving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <LuSaveAll size={18} />
                Save Resume
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-100 cursor-pointer"
          >
            <FaTrashCan size={18} />
            Delete Resume
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {currResume.jobLink && (
          <div className="">
            <p className="mb-1  text-sm font-medium text-gray-700 mt-2 ">
              Job Link
            </p>
            <a
              href={currResume.jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition hover:underline focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            >
              <span className="truncate">{currResume.jobLink}</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 3h7m0 0v7m0-7L10 14"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 10v11h11"
                />
              </svg>
            </a>
          </div>
        )}

        <Input
          label="Name/Company"
          name="targetCompany"
          value={currResume?.targetCompany || ''}
          updateField={updateField}
        />

        <div>
          <Input
            label="Name"
            name="name"
            value={currResume.name}
            updateField={updateField}
          />
        </div>

        <div>
          <Input
            label="Subtitle"
            name="header"
            value={currResume.header}
            updateField={updateField}
          />
        </div>

        <div>
          <Input
            label="Contact"
            name="contact"
            value={currResume.contact}
            updateField={updateField}
          />
        </div>

        <div>
          <Input
            label="Portfolio"
            name="portfolio"
            value={currResume.portfolio}
            updateField={updateField}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Summary
          </label>
          <textarea
            rows={5}
            value={currResume.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="">
          <label className="mb-1 block text-sm font-medium text-gray-700 ">
            Skills
          </label>

          {currResume.skills.map((skillGroup, index) => (
            <div
              key={index}
              className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={skillGroup.category}
                  onChange={(e) => updateSkillCategory(index, e.target.value)}
                  placeholder="Category"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 cursor-pointer"
                  onClick={() => removeSkill(index)}
                >
                  {' '}
                  <FaMinus />
                </button>
              </div>

              <textarea
                rows={3}
                value={skillGroup.items.join(', ')}
                onChange={(e) => updateSkillItems(index, e.target.value)}
                placeholder="React, Next.js, TypeScript"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          ))}
          <button
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
            onClick={addSkill}
          >
            {' '}
            Add skill{' '}
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Education
          </label>
          <input
            type="text"
            value={currResume.education}
            onChange={(e) => updateField('education', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Experience</h3>

        <div className="space-y-6">
          {currResume.experience.map((job, jobIndex) => (
            <div
              key={jobIndex}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="space-y-3">
                <input
                  type="text"
                  value={job.role}
                  onChange={(e) =>
                    updateExperienceField(jobIndex, 'role', e.target.value)
                  }
                  placeholder="Role"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                />

                <input
                  type="text"
                  value={job.company}
                  onChange={(e) =>
                    updateExperienceField(jobIndex, 'company', e.target.value)
                  }
                  placeholder="Company"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                />

                <input
                  type="text"
                  value={job.date}
                  onChange={(e) =>
                    updateExperienceField(jobIndex, 'date', e.target.value)
                  }
                  placeholder="Date"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                />

                <div className="space-y-2">
                  {job.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex items-start gap-2">
                      <textarea
                        rows={3}
                        value={bullet}
                        onChange={(e) =>
                          updateBullet(jobIndex, bulletIndex, e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                      />

                      <button
                        type="button"
                        onClick={() => removeBullet(jobIndex, bulletIndex)}
                        className="mt-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 cursor-pointer"
                      >
                        <FaMinus />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addBullet(jobIndex)}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
                >
                  Add Bullet
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addExperience}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
        >
          Add Experience
        </button>
      </div>
    </div>
  );
};
