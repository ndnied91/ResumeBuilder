import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useUser, useAuth } from '@clerk/clerk-react';

import { useAppContext } from '../../../context/useAppContext';
import { useReactToPrint } from 'react-to-print';
import { mapResumeToState } from '../../../utils/helper';
import DeleteModal from '../DeleteModal';
import Header from './Header';
import ToolBar from './ToolBar';
import { Input } from './Input';

import EditableField from './EditableField';

import { sanitizeHtml, sanitizeText } from './utils';

const PAGE_HEIGHT_PX = 11 * 96; // 11in at 96 CSS px per inch

const styleSettings = {
  nameSize: 15,
  headingSize: 15,
  bodySize: 12,
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/70';

export const ResumeParser = () => {
  const { currResume, setCurrResume, setAllResumes, createResume } =
    useAppContext();

  const resumeRef = useRef(null);
  const [showEdit, setShowEdit] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false); //for deleting resumes

  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();

  const [isSaving, isSetSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const [contentHeight, setContentHeight] = useState(0);

  const hasResume = currResume.resumeId !== null;

  // Re-run once the resume is loaded, since the resume div doesn't exist while loading
  useEffect(() => {
    const el = resumeRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      setContentHeight(el.offsetHeight);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasResume]);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${currResume?.name?.replace(/\s+/g, '_') || 'Resume'}`,
    pageStyle: `@page { size: letter; margin: 0; }`,
  });

  const handleSafePrint = () => {
    if (!currResume || !currResume.name) return;
    handlePrint();
  };

  const pageCount = Math.max(1, Math.ceil(contentHeight / PAGE_HEIGHT_PX));
  const overflowPx = contentHeight - PAGE_HEIGHT_PX;
  const isOverflowing = overflowPx > 1;
  const overflowLines = Math.ceil(overflowPx / (styleSettings.bodySize * 1.3));

  // Helper: change one job
  const updateJob = (jobIndex, updater) => {
    setCurrResume((prev) => ({
      ...prev,
      experience: prev.experience.map((job, index) =>
        index === jobIndex ? updater(job) : job,
      ),
    }));
  };

  // Helper: change one skill group
  const updateSkillGroup = (groupIndex, updater) => {
    setCurrResume((prev) => ({
      ...prev,
      skills: prev.skills.map((group, index) =>
        index === groupIndex ? updater(group) : group,
      ),
    }));
  };

  const addBulletToJob = (jobIndex) => {
    updateJob(jobIndex, (job) => ({
      ...job,
      bullets: [...(job.bullets || []), ''],
    }));
  };

  const removeBullet = (jobIndex, bulletIndex) => {
    updateJob(jobIndex, (job) => ({
      ...job,
      bullets: (job.bullets || []).filter((_, i) => i !== bulletIndex),
    }));
  };

  // Plain text fields (name, title inputs)
  const commitTopLevelField = (field, value) => {
    const cleanedValue = sanitizeText(value);
    setCurrResume((prev) => ({ ...prev, [field]: cleanedValue }));
  };

  // Raw value while typing (no trimming)
  const setTopLevelField = (field, value) => {
    setCurrResume((prev) => ({ ...prev, [field]: value }));
  };

  // Rich text fields (keep bold / italic / underline / links)
  const commitRichField = (field, html) => {
    const cleanedValue = sanitizeHtml(html);
    setCurrResume((prev) => ({ ...prev, [field]: cleanedValue }));
  };

  const commitExperienceField = (jobIndex, field, html) => {
    const cleanedValue = sanitizeHtml(html);
    updateJob(jobIndex, (job) => ({ ...job, [field]: cleanedValue }));
  };

  const commitBullet = (jobIndex, bulletIndex, html) => {
    const cleanedValue = sanitizeHtml(html);
    updateJob(jobIndex, (job) => ({
      ...job,
      bullets: (job.bullets || []).map((bullet, i) =>
        i === bulletIndex ? cleanedValue : bullet,
      ),
    }));
  };

  const commitSkillCategory = (groupIndex, value) => {
    const cleanedValue = sanitizeText(value).replace(/:/g, '');
    updateSkillGroup(groupIndex, (group) => ({
      ...group,
      category: cleanedValue,
    }));
  };

  const commitSkillItems = (groupIndex, value) => {
    const parsedItems = sanitizeText(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    updateSkillGroup(groupIndex, (group) => ({ ...group, items: parsedItems }));
  };

  const updateResume = async () => {
    if (!isSignedIn || !user) return;

    isSetSaving(true);

    try {
      const token = await getToken(); // from Clerk
      const res = await fetch(`/api/users/resumes/${currResume.resumeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currResume),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || 'Failed to save resume');
        return;
      }

      toast.success('Resume saved successfully!', { duration: 2000 });
      setAllResumes((prev) =>
        prev.map((resume) => (resume.id === data.id ? data : resume)),
      );
      setCurrResume((prev) => ({ ...prev, updatedAt: data.updatedAt }));
      setShowEdit(false);
    } catch (error) {
      console.error('Failed to save resume:', error);
      toast.error('Failed to save resume');
    } finally {
      isSetSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!currResume?.resumeId || isDuplicating) return;

    setIsDuplicating(true);
    try {
      const copy = duplicateResume(currResume);
      const saved = await createResume(getToken, copy);

      if (!saved) return;

      setCurrResume(mapResumeToState(saved));
      setShowEdit(true);
    } finally {
      setIsDuplicating(false);
    }
  };

  const isBusy = isSaving || isDuplicating;

  const duplicateResume = (resume) => {
    const { resumeId, id, ...rest } = structuredClone(resume);

    return {
      ...rest,
      targetCompany: `${resume.targetCompany || 'Untitled'} (copy)`,
      jobLink: '',
      jobDescription: '',
    };
  };

  return (
    <section className="p-6">
      {showDeleteModal && (
        <DeleteModal
          setShowDeleteModal={setShowDeleteModal}
          showDeleteModal={showDeleteModal}
        />
      )}

      <Header
        showEdit={showEdit}
        setShowEdit={setShowEdit}
        handleDuplicate={handleDuplicate}
        isBusy={isBusy}
        isOverflowing={isOverflowing}
        overflowLines={overflowLines}
        handleSafePrint={handleSafePrint}
      />

      <div
        className={`min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${
          !showEdit ? 'mx-auto w-full max-w-4xl' : ''
        }`}
      >
        <ToolBar
          showEdit={showEdit}
          isBusy={isBusy}
          isSaving={isSaving}
          updateResume={updateResume}
          setShowDeleteModal={setShowDeleteModal}
        />

        {!hasResume ? (
          <div
            role="status"
            className="flex h-[calc(100vh-220px)] flex-col items-center justify-center gap-3"
          >
            <span
              aria-hidden="true"
              className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
            />
            <p className="text-sm font-medium text-gray-500">
              Loading resume...
            </p>
          </div>
        ) : (
          <div className="h-[calc(100vh-220px)] overflow-auto rounded-xl bg-gray-100 p-4">
            {showEdit && (
              <div className="flex justify-center">
                <div className="mb-6 w-204 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input
                      label="Title"
                      name="title"
                      value={currResume.title}
                      onChange={setTopLevelField}
                      onBlur={commitTopLevelField}
                      placeholder="Enter resume title..."
                    />

                    <Input
                      label="Company"
                      name="targetCompany"
                      value={currResume.targetCompany}
                      onChange={setTopLevelField}
                      onBlur={commitTopLevelField}
                      placeholder="Enter company name..."
                    />

                    <Input
                      label="Job Link"
                      name="jobLink"
                      type="url"
                      value={currResume.jobLink}
                      onChange={setTopLevelField}
                      onBlur={commitTopLevelField}
                      placeholder="Paste job link..."
                    />

                    <div className="text-xs text-gray-500">
                      <p>
                        {currResume.createdAt &&
                          `Created ${new Date(currResume.createdAt).toLocaleString()}`}
                      </p>
                      <p>
                        {currResume.updatedAt &&
                          `Last saved ${new Date(currResume.updatedAt).toLocaleString()}`}
                      </p>
                    </div>

                    {/* Always rendered so screen readers announce it when it appears */}
                    <div role="status">
                      {isOverflowing && (
                        <span className="flex h-11 items-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700">
                          ~{overflowLines}{' '}
                          {overflowLines === 1 ? 'line' : 'lines'} over 1 page
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex min-w-0 justify-center">
              <div className="relative w-full max-w-204">
                <article
                  ref={resumeRef}
                  aria-label={showEdit ? 'Resume editor' : 'Resume preview'}
                  className="w-full min-h-264 bg-white px-12 py-8 text-black print:min-h-0 [&_a]:underline"
                  style={{
                    fontFamily: 'Calibri, Arial, Helvetica, sans-serif',
                  }}
                >
                  <header className="border-b border-gray-300 pb-2 text-center">
                    <EditableField
                      as="h2"
                      rich={false}
                      editable={showEdit}
                      label="Name"
                      value={currResume?.name}
                      onCommit={(text) => commitTopLevelField('name', text)}
                      fontSize={styleSettings.nameSize}
                      className="font-bold tracking-wide"
                    />

                    {[
                      ['header', 'Location and links'],
                      ['contact', 'Contact information'],
                      ['portfolio', 'Portfolio'],
                    ].map(([field, label]) => (
                      <EditableField
                        key={field}
                        as="p"
                        editable={showEdit}
                        label={label}
                        value={currResume?.[field]}
                        onCommit={(html) => commitRichField(field, html)}
                        fontSize={styleSettings.bodySize + 1}
                        className="leading-[1.3]"
                      />
                    ))}
                  </header>

                  <section className="mt-1.5">
                    <h3
                      className="font-bold tracking-wider"
                      style={{ fontSize: `${styleSettings.headingSize}px` }}
                    >
                      Summary
                    </h3>

                    <EditableField
                      as="div"
                      editable={showEdit}
                      label="Summary"
                      multiline
                      value={currResume?.summary}
                      onCommit={(html) => commitRichField('summary', html)}
                      fontSize={styleSettings.bodySize}
                      className="leading-[1.3]"
                    />
                  </section>

                  <section className="mt-1.5">
                    <h3
                      className="font-bold tracking-wider"
                      style={{ fontSize: `${styleSettings.headingSize}px` }}
                    >
                      Technical Skills
                    </h3>

                    <div className="space-y-0.5">
                      {currResume?.skills?.map((skillGroup, index) => (
                        <p
                          key={`skill-group-${index}`}
                          style={{ fontSize: `${styleSettings.bodySize}px` }}
                          className="leading-[1.3]"
                        >
                          <EditableField
                            as="span"
                            rich={false}
                            editable={showEdit}
                            label={`Skill category ${index + 1}`}
                            value={skillGroup.category}
                            onCommit={(text) =>
                              commitSkillCategory(index, text)
                            }
                            className="font-semibold"
                          />
                          :{' '}
                          <EditableField
                            as="span"
                            rich={false}
                            editable={showEdit}
                            label={`${skillGroup.category || `Skill category ${index + 1}`} skills, comma separated`}
                            value={skillGroup.items?.join(', ')}
                            onCommit={(text) => commitSkillItems(index, text)}
                          />
                        </p>
                      ))}
                    </div>
                  </section>

                  <section className="mt-1.5">
                    <h3
                      className="font-bold tracking-wider"
                      style={{ fontSize: `${styleSettings.headingSize}px` }}
                    >
                      Work Experience
                    </h3>

                    <div className="space-y-2">
                      {currResume?.experience?.map((job, index) => {
                        const jobName =
                          (job.company || '').replace(/<[^>]*>/g, '') ||
                          `Job ${index + 1}`;

                        return (
                          <div
                            key={`experience-${index}`}
                            className="relative"
                            style={{ fontSize: `${styleSettings.bodySize}px` }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <EditableField
                                editable={showEdit}
                                label={`Company, job ${index + 1}`}
                                value={job.company}
                                onCommit={(html) =>
                                  commitExperienceField(index, 'company', html)
                                }
                                className="font-bold leading-[1.3]"
                              />

                              <EditableField
                                editable={showEdit}
                                label={`Dates, ${jobName}`}
                                value={job.date}
                                onCommit={(html) =>
                                  commitExperienceField(index, 'date', html)
                                }
                                className="font-bold leading-[1.3]"
                              />
                            </div>

                            <EditableField
                              editable={showEdit}
                              label={`Role, ${jobName}`}
                              value={job.role}
                              onCommit={(html) =>
                                commitExperienceField(index, 'role', html)
                              }
                              className="italic leading-tight"
                            />

                            <ul className="mt-0.5 list-disc pl-4 leading-[1.3]">
                              {job.bullets?.map((bullet, bulletIndex) => (
                                <li
                                  key={`job-bullet-${index}-${bulletIndex}-${bullet}`}
                                  className="group relative"
                                >
                                  <EditableField
                                    as="span"
                                    editable={showEdit}
                                    label={`${jobName}, bullet ${bulletIndex + 1}. Press Enter to add a bullet.`}
                                    value={bullet}
                                    onCommit={(html) =>
                                      commitBullet(index, bulletIndex, html)
                                    }
                                    className="block"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addBulletToJob(index);
                                      }

                                      if (
                                        e.key === 'Backspace' &&
                                        !e.currentTarget.textContent.trim()
                                      ) {
                                        e.preventDefault();
                                        removeBullet(index, bulletIndex);
                                      }
                                    }}
                                  />

                                  {showEdit && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeBullet(index, bulletIndex)
                                      }
                                      aria-label={`Remove bullet ${bulletIndex + 1} from ${jobName}`}
                                      className={`absolute -right-7 top-0 cursor-pointer rounded px-1 text-xs text-gray-500 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 hover:bg-red-50 hover:text-red-600 ${focusRing}`}
                                    >
                                      <span aria-hidden="true">✕</span>
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>

                            {showEdit && (
                              <button
                                type="button"
                                onClick={() => addBulletToJob(index)}
                                title="Add bullet"
                                aria-label={`Add bullet to ${jobName}`}
                                className={`absolute -left-9 bottom-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 transition hover:bg-gray-50 ${focusRing}`}
                              >
                                <span aria-hidden="true">+</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="mt-1">
                    <h3
                      className="font-bold tracking-wider"
                      style={{ fontSize: `${styleSettings.headingSize}px` }}
                    >
                      Education
                    </h3>

                    <div style={{ fontSize: `${styleSettings.bodySize}px` }}>
                      <div className="flex justify-between gap-4">
                        <EditableField
                          editable={showEdit}
                          label="School"
                          value={currResume?.education}
                          onCommit={(html) =>
                            commitRichField('education', html)
                          }
                          className="font-bold leading-[1.3]"
                        />

                        <EditableField
                          editable={showEdit}
                          label="School location"
                          value={currResume?.edu_location}
                          onCommit={(html) =>
                            commitRichField('edu_location', html)
                          }
                          className="font-bold leading-[1.3]"
                        />
                      </div>

                      {[
                        ['edu_desc', 'Degree'],
                        ['edu_honors', 'Honors'],
                      ].map(([field, label]) => (
                        <EditableField
                          key={field}
                          editable={showEdit}
                          label={label}
                          value={currResume?.[field]}
                          onCommit={(html) => commitRichField(field, html)}
                          className="italic leading-[1.3]"
                        />
                      ))}
                    </div>
                  </section>
                </article>

                {/* Visual page-break guides (the overflow status covers this for screen readers) */}
                {Array.from({ length: pageCount - 1 }, (_, i) => (
                  <div
                    key={`page-break-${i}`}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 right-0 border-t-2 border-dashed border-red-400"
                    style={{ top: (i + 1) * PAGE_HEIGHT_PX }}
                  >
                    <span className="absolute -top-5 right-2 rounded bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                      Page {i + 2}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
