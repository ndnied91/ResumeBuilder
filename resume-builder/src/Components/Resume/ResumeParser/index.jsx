import { useEffect, useRef, useState } from 'react';
import { MdModeEdit } from 'react-icons/md';
import { FaRegFilePdf, FaTrashCan } from 'react-icons/fa6';
import { FaRegCopy } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import toast from 'react-hot-toast';
import { useUser, useAuth } from '@clerk/clerk-react';
import DOMPurify from 'dompurify';

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

export const ResumeParser = () => {
  const { currResume, setCurrResume, allResumes, setAllResumes, createResume } =
    useAppContext();

  const resumeRef = useRef(null);
  const [showEdit, setShowEdit] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false); //for deleting resumes

  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();

  const [isSaving, isSetSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const el = resumeRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      setContentHeight(el.offsetHeight);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const defaultStyleSettings = {
    nameSize: 15,
    headingSize: 15,
    bodySize: 12,
  };

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${currResume?.name?.replace(/\s+/g, '_') || 'Resume'}`,
    pageStyle: `@page { size: letter; margin: 0; }`,
  });

  const handleSafePrint = () => {
    if (!currResume || !currResume.name) return;
    handlePrint();
  };

  const styleSettings = {
    ...defaultStyleSettings,
  };

  const pageCount = Math.max(1, Math.ceil(contentHeight / PAGE_HEIGHT_PX));
  const overflowPx = contentHeight - PAGE_HEIGHT_PX;
  const isOverflowing = overflowPx > 1;
  const overflowLines = Math.ceil(overflowPx / (styleSettings.bodySize * 1.3));

  const editableClass = showEdit
    ? 'rounded outline-none transition hover:bg-yellow-50 focus:bg-yellow-50'
    : '';

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

  const updateStyleSetting = (field, value) => {
    const nextValue = Math.max(8, Math.min(24, value));

    setCurrResume((prev) => ({
      ...prev,
      styleSettings: {
        ...defaultStyleSettings,
        ...(prev?.styleSettings || {}),
        [field]: nextValue,
      },
    }));
  };

  const incrementStyle = (field) => {
    updateStyleSetting(field, styleSettings[field] + 1);
  };

  const decrementStyle = (field) => {
    updateStyleSetting(field, styleSettings[field] - 1);
  };

  const resetStyles = () => {
    setCurrResume((prev) => ({
      ...prev,
      styleSettings: defaultStyleSettings,
    }));
  };

  const updateResume = async () => {
    if (!isSignedIn || !user) return;

    isSetSaving(true);
    const token = await getToken(); // from Clerk
    const res = await fetch(`/api/users/resumes/${currResume.resumeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, //
      },
      body: JSON.stringify(currResume),
    });

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
    setShowEdit((prev) => !prev);
    return data;
  };

  const handleDuplicate = async () => {
    if (!currResume?.resumeId || isDuplicating) return;

    setIsDuplicating(true);
    try {
      const copy = duplicateResume(currResume);
      console.log(copy);
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
          styleSettings={styleSettings}
          incrementStyle={incrementStyle}
          decrementStyle={decrementStyle}
          resetStyles={resetStyles}
        />

        <div className="h-[calc(100vh-220px)] overflow-auto rounded-xl bg-gray-100 p-4 ">
          {showEdit && (
            <div className="flex justify-center">
              <div className="mb-6 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm w-[8.5in]">
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
                    value={currResume.jobLink}
                    onChange={setTopLevelField}
                    onBlur={commitTopLevelField}
                    placeholder="Paste job link..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* end of title  */}
          <div className="flex min-w-0 justify-center">
            <div className="relative w-full max-w-[8.5in]">
              <div
                ref={resumeRef}
                className="w-full min-h-[11in] bg-white px-12 py-8 text-black print:min-h-0 [&_a]:underline"
                style={{
                  fontFamily: 'Calibri, Arial, Helvetica, sans-serif',
                }}
              >
                <header className="border-b border-gray-300 pb-2 text-center">
                  <EditableField
                    as="h1"
                    rich={false}
                    editable={showEdit}
                    value={currResume?.name}
                    onCommit={(text) => commitTopLevelField('name', text)}
                    fontSize={styleSettings.nameSize}
                    className="font-bold tracking-wide"
                  />

                  {['header', 'contact', 'portfolio'].map((field) => (
                    <EditableField
                      key={field}
                      as="p"
                      editable={showEdit}
                      value={currResume?.[field]}
                      onCommit={(html) => commitRichField(field, html)}
                      fontSize={styleSettings.bodySize + 1}
                      className="leading-[1.3]"
                    />
                  ))}
                </header>

                <section className="mt-1.5">
                  <h2
                    className="font-bold tracking-wider"
                    style={{ fontSize: `${styleSettings.headingSize}px` }}
                  >
                    Summary
                  </h2>

                  <EditableField
                    as="div"
                    editable={showEdit}
                    value={currResume?.summary}
                    onCommit={(html) => commitRichField('summary', html)}
                    fontSize={styleSettings.bodySize}
                    className="leading-[1.3]"
                  />
                </section>

                <section className="mt-1.5">
                  <h2
                    className="font-bold tracking-wider"
                    style={{ fontSize: `${styleSettings.headingSize}px` }}
                  >
                    Technical Skills
                  </h2>

                  <div className="space-y-[2px]">
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
                          value={skillGroup.category}
                          onCommit={(text) => commitSkillCategory(index, text)}
                          className="font-semibold"
                        />
                        :{' '}
                        <EditableField
                          as="span"
                          rich={false}
                          editable={showEdit}
                          value={skillGroup.items?.join(', ')}
                          onCommit={(text) => commitSkillItems(index, text)}
                        />
                      </p>
                    ))}
                  </div>
                </section>

                <section className="mt-1.5">
                  <h2
                    className="font-bold tracking-wider"
                    style={{ fontSize: `${styleSettings.headingSize}px` }}
                  >
                    Work Experience
                  </h2>

                  <div className="space-y-2">
                    {currResume?.experience?.map((job, index) => (
                      <div
                        key={`experience-${index}`}
                        className="relative"
                        style={{ fontSize: `${styleSettings.bodySize}px` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <EditableField
                            editable={showEdit}
                            value={job.company}
                            onCommit={(html) =>
                              commitExperienceField(index, 'company', html)
                            }
                            className="font-bold leading-[1.3]"
                          />

                          <EditableField
                            editable={showEdit}
                            value={job.date}
                            onCommit={(html) =>
                              commitExperienceField(index, 'date', html)
                            }
                            className="font-bold leading-[1.3]"
                          />
                        </div>

                        <EditableField
                          editable={showEdit}
                          value={job.role}
                          onCommit={(html) =>
                            commitExperienceField(index, 'role', html)
                          }
                          className="italic leading-tight"
                        />

                        <ul className="mt-[2px] list-disc pl-4 leading-[1.3]">
                          {job.bullets?.map((bullet, bulletIndex) => (
                            <li
                              key={`job-bullet-${index}-${bulletIndex}-${bullet}`}
                              className="group relative"
                            >
                              <EditableField
                                as="span"
                                editable={showEdit}
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
                                  className="absolute -right-7 top-0 cursor-pointer rounded px-1 text-xs text-gray-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                                  aria-label="Remove bullet"
                                >
                                  ✕
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
                            aria-label="Add bullet"
                            className="absolute -left-9 bottom-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            +
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-1">
                  <h2
                    className="font-bold tracking-wider"
                    style={{ fontSize: `${styleSettings.headingSize}px` }}
                  >
                    Education
                  </h2>

                  <div style={{ fontSize: `${styleSettings.bodySize}px` }}>
                    <div className="flex justify-between gap-4">
                      <EditableField
                        editable={showEdit}
                        value={currResume?.education}
                        onCommit={(html) => commitRichField('education', html)}
                        className="font-bold leading-[1.3]"
                      />

                      <EditableField
                        editable={showEdit}
                        value={currResume?.edu_location}
                        onCommit={(html) =>
                          commitRichField('edu_location', html)
                        }
                        className="font-bold leading-[1.3]"
                      />
                    </div>

                    {['edu_desc', 'edu_honors'].map((field) => (
                      <EditableField
                        key={field}
                        editable={showEdit}
                        value={currResume?.[field]}
                        onCommit={(html) => commitRichField(field, html)}
                        className="italic leading-[1.3]"
                      />
                    ))}
                  </div>
                </section>
              </div>
              {/* end of resumeRef div */}

              {Array.from({ length: pageCount - 1 }, (_, i) => (
                <div
                  key={`page-break-${i}`}
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
      </div>
    </section>
  );
};
