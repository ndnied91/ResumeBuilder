import React, { useState } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { useUser, useAuth } from '@clerk/clerk-react';
import { FaTrashCan } from 'react-icons/fa6';
import { LuSaveAll } from 'react-icons/lu';
import toast from 'react-hot-toast';
import FocusTrap from 'focus-trap-react';

import { blankResume, mapResumeToState } from '../../utils/helper';

export const EditResume = () => {
  const { currResume, setCurrResume, userIds, allResumes, setAllResumes } =
    useAppContext();

  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();

  const [isSaving, isSetSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const updateField = (field, value) => {
    console.log('in update field', field, value);
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
    console.log(res);
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

    console.log('patch', data);

    isSetSaving(false);
    return data;
  };

  const createResume = async () => {
    if (!isSignedIn || !user) return;

    isSetSaving(true);

    const token = await getToken(); // from Clerk

    try {
      const res = await fetch('/api/users/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clerkId: user.id,
          currResume,
        }),
      });

      const data = await res.json();
      isSetSaving(false);

      if (res.status === 201) {
        toast.success('Resume saved successfully!', {
          duration: 2000,
        });
      } else {
        toast.error(data?.message || 'Failed to save resume');
      }

      // add new resume to all resumes
      setAllResumes((prev) => [...prev, data]);

      console.log('Resume saved successfully');
    } catch (error) {
      console.error('Failed to save resume:', error);
    }
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
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={deleteResume}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
            onClick={currResume.resumeId !== null ? updateResume : createResume}
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
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={currResume.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={currResume.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Subtitle
          </label>
          <input
            type="text"
            value={currResume.header}
            onChange={(e) => updateField('header', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contact
          </label>
          <input
            type="text"
            value={currResume.contact}
            onChange={(e) => updateField('contact', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Portfolio
          </label>
          <input
            type="text"
            value={currResume.portfolio}
            onChange={(e) => updateField('portfolio', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
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

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Skills
          </label>

          {currResume.skills.map((skillGroup, index) => (
            <div
              key={index}
              className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <input
                type="text"
                value={skillGroup.category}
                onChange={(e) => updateSkillCategory(index, e.target.value)}
                placeholder="Category"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />

              <textarea
                rows={3}
                value={skillGroup.items.join(', ')}
                onChange={(e) => updateSkillItems(index, e.target.value)}
                placeholder="React, Next.js, TypeScript"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          ))}
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
                    <textarea
                      key={bulletIndex}
                      rows={3}
                      value={bullet}
                      onChange={(e) =>
                        updateBullet(jobIndex, bulletIndex, e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                    />
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
