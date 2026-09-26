import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { MdModeEdit } from 'react-icons/md';
import { useReactToPrint } from 'react-to-print';
import { FaRegFilePdf, FaTrashCan } from 'react-icons/fa6';
import { FaRegCopy } from 'react-icons/fa';
import { mapResumeToState, blankResume } from '../../utils/helper';
import { IoMdAdd } from 'react-icons/io';
import toast from 'react-hot-toast';
import { useUser, useAuth } from '@clerk/clerk-react';
import DOMPurify from 'dompurify';
import DeleteModal from './DeleteModal';

const PAGE_HEIGHT_PX = 11 * 96; // 11in at 96 CSS px per inch

const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'a', 'br'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
};

const sanitizeHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html, RICH_TEXT_CONFIG)
    .replace(/&nbsp;/g, ' ')
    .replace(/(<br\s*\/?>\s*)+$/i, '')
    .trim();
};

const asHtml = (value) => ({ __html: value || '' });

export const ResumeParser = () => {
  const { currResume, setCurrResume, allResumes, setAllResumes, createResume } =
    useAppContext();

  const resumeRef = useRef(null);
  const [showEdit, setShowEdit] = useState(false);
  const [activeEditor, setActiveEditor] = useState(null);
  const [draftResume, setDraftResume] = useState(currResume);

  const [showDeleteModal, setShowDeleteModal] = useState(false); //for deleting resumes

  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();

  const [isSaving, isSetSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    setDraftResume(currResume);
  }, [currResume]);

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

  const handleSelectResume = (resumeId) => {
    const found = allResumes.find((r) => (r.resumeId || r.id) === resumeId);
    if (!found) return;

    const mapped = mapResumeToState(found);
    setCurrResume(mapped);
  };

  const styleSettings = {
    ...defaultStyleSettings,
    ...(draftResume?.styleSettings || {}),
  };

  const pageCount = Math.max(1, Math.ceil(contentHeight / PAGE_HEIGHT_PX));
  const overflowPx = contentHeight - PAGE_HEIGHT_PX;
  const isOverflowing = overflowPx > 1;
  const overflowLines = Math.ceil(overflowPx / (styleSettings.bodySize * 1.3));

  const runCommand = (command, value = null) => {
    // Use <b>/<i>/<u> tags instead of inline style spans (Firefox default)
    document.execCommand('styleWithCSS', false, false);
    document.execCommand(command, false, value);
  };

  const editableClass = showEdit
    ? 'rounded outline-none transition hover:bg-yellow-50 focus:bg-yellow-50'
    : '';

  const activeHighlight = (key) =>
    showEdit && activeEditor === key ? 'bg-yellow-50' : '';

  const sanitizeText = (value) => {
    if (!value) return '';
    return value
      .replace(/ /g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handlePlainTextKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  };

  const addBulletToJob = (jobIndex) => {
    setDraftResume((prev) => ({
      ...prev,
      experience: prev.experience.map((job, index) =>
        index === jobIndex
          ? { ...job, bullets: [...(job.bullets || []), ''] }
          : job,
      ),
    }));

    setCurrResume((prev) => ({
      ...prev,
      experience: prev.experience.map((job, index) =>
        index === jobIndex
          ? { ...job, bullets: [...(job.bullets || []), ''] }
          : job,
      ),
    }));
  };

  const removeBullet = (jobIndex, bulletIndex) => {
    const update = (prev) => ({
      ...prev,
      experience: prev.experience.map((job, index) =>
        index === jobIndex
          ? {
              ...job,
              bullets: (job.bullets || []).filter((_, i) => i !== bulletIndex),
            }
          : job,
      ),
    });

    setDraftResume(update);
    setCurrResume(update);
  };

  // Plain text fields (name, title input)
  const commitTopLevelField = (field, value) => {
    const cleanedValue = sanitizeText(value);

    setDraftResume((prev) => ({
      ...prev,
      [field]: cleanedValue,
    }));

    setCurrResume((prev) => ({
      ...prev,
      [field]: cleanedValue,
    }));
  };

  // Rich text fields (keep bold / italic / underline / links)
  const commitRichField = (field, html) => {
    const cleanedValue = sanitizeHtml(html);

    setDraftResume((prev) => ({
      ...prev,
      [field]: cleanedValue,
    }));

    setCurrResume((prev) => ({
      ...prev,
      [field]: cleanedValue,
    }));
  };

  const commitExperienceField = (jobIndex, field, html) => {
    const cleanedValue = sanitizeHtml(html);

    setDraftResume((prev) => ({
      ...prev,
      experience: prev.experience.map((job, index) =>
        index === jobIndex ? { ...job, [field]: cleanedValue } : job,
      ),
    }));

    setCurrResume((prev) => ({
      ...prev,
      experience: prev.experience.map((job, index) =>
        index === jobIndex ? { ...job, [field]: cleanedValue } : job,
      ),
    }));
  };

  const commitBullet = (jobIndex, bulletIndex, html) => {
    const cleanedValue = sanitizeHtml(html);

    setDraftResume((prev) => ({
      ...prev,
      experience: prev.experience.map((job, index) =>
        index === jobIndex
          ? {
              ...job,
              bullets: (job.bullets || []).map((bullet, i) =>
                i === bulletIndex ? cleanedValue : bullet,
              ),
            }
          : job,
      ),
    }));

    setCurrResume((prev) => ({
      ...prev,
      experience: prev.experience.map((job, index) =>
        index === jobIndex
          ? {
              ...job,
              bullets: (job.bullets || []).map((bullet, i) =>
                i === bulletIndex ? cleanedValue : bullet,
              ),
            }
          : job,
      ),
    }));
  };

  const commitSkillCategory = (groupIndex, value) => {
    const cleanedValue = sanitizeText(value).replace(/:/g, '');

    setDraftResume((prev) => ({
      ...prev,
      skills: prev.skills.map((group, index) =>
        index === groupIndex ? { ...group, category: cleanedValue } : group,
      ),
    }));

    setCurrResume((prev) => ({
      ...prev,
      skills: prev.skills.map((group, index) =>
        index === groupIndex ? { ...group, category: cleanedValue } : group,
      ),
    }));
  };

  const commitSkillItems = (groupIndex, value) => {
    const parsedItems = sanitizeText(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setDraftResume((prev) => ({
      ...prev,
      skills: prev.skills.map((group, index) =>
        index === groupIndex ? { ...group, items: parsedItems } : group,
      ),
    }));

    setCurrResume((prev) => ({
      ...prev,
      skills: prev.skills.map((group, index) =>
        index === groupIndex ? { ...group, items: parsedItems } : group,
      ),
    }));
  };

  const updateStyleSetting = (field, value) => {
    const nextValue = Math.max(8, Math.min(24, value));

    setDraftResume((prev) => ({
      ...prev,
      styleSettings: {
        ...defaultStyleSettings,
        ...(prev?.styleSettings || {}),
        [field]: nextValue,
      },
    }));

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
    setDraftResume((prev) => ({
      ...prev,
      styleSettings: defaultStyleSettings,
    }));

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
        Authorization: `Bearer ${token}`, // ✅ THIS is what matters
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Format Resume
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Edit your content and preview the final resume side by side.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={currResume?.resumeId || currResume?.id || ''}
            onChange={(e) => handleSelectResume(e.target.value)}
            className="h-11 min-w-[190px] rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="" disabled>
              Select Resume
            </option>

            {allResumes?.map((resume) => (
              <option
                key={resume.resumeId || resume.id}
                value={resume.resumeId || resume.id}
              >
                {resume.targetCompany || 'Untitled Resume'}
              </option>
            ))}
          </select>

          {showEdit ? (
            <>
              <button
                type="button"
                onClick={() => setCurrResume(blankResume)}
                disabled={isBusy}
                className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:hover:border-gray-200 disabled:hover:bg-gray-100"
              >
                <IoMdAdd size={18} />
                Create New
              </button>

              <button
                type="button"
                onClick={handleDuplicate}
                disabled={isBusy}
                className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:hover:border-gray-200 disabled:hover:bg-gray-100"
              >
                <FaRegCopy size={18} />
                Duplicate
              </button>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setShowEdit((prev) => !prev)}
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-gray-300 hover:bg-gray-50"
          >
            <MdModeEdit size={18} />
            {showEdit ? 'Hide Editor' : 'Show Editor'}
          </button>

          {isOverflowing && (
            <span className="flex h-11 items-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700">
              ~{overflowLines} {overflowLines === 1 ? 'line' : 'lines'} over 1
              page
            </span>
          )}

          <button
            type="button"
            onClick={handleSafePrint}
            disabled={showEdit}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition ${
              showEdit
                ? 'cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200'
                : 'cursor-pointer bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FaRegFilePdf size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div
        className={`min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${
          !showEdit ? 'mx-auto w-full max-w-4xl' : ''
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex w-full flex-row justify-between rounded-xl">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={updateResume}
                disabled={isBusy}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 h-12 text-sm font-medium transition ${
                  showEdit
                    ? isBusy
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-700 cursor-pointer'
                    : 'hidden'
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <MdModeEdit size={16} />
                    Save Resume
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isBusy}
                className={`flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                  showEdit
                    ? isBusy
                      ? 'bg-red-300 text-white cursor-not-allowed'
                      : 'rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-100 cursor-pointer'
                    : 'hidden'
                }`}
              >
                <FaTrashCan size={16} />
                Delete Resume
              </button>
            </div>

            {showEdit && (
              <>
                <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      runCommand('bold');
                    }}
                    className="cursor-pointer rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Bold
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      runCommand('italic');
                    }}
                    className="cursor-pointer rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Italic
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      runCommand('underline');
                    }}
                    className="cursor-pointer rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Underline
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const url = window.prompt('Enter URL');
                      if (url) runCommand('createLink', url);
                    }}
                    className="cursor-pointer rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Link
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Name
                    </span>
                    <button
                      type="button"
                      onClick={() => decrementStyle('nameSize')}
                      className="h-7 w-7 cursor-pointer rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="min-w-[42px] text-center text-xs text-gray-700">
                      {styleSettings.nameSize}px
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementStyle('nameSize')}
                      className="h-7 w-7 cursor-pointer rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Headings
                    </span>
                    <button
                      type="button"
                      onClick={() => decrementStyle('headingSize')}
                      className="h-7 w-7 cursor-pointer rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="min-w-[42px] text-center text-xs text-gray-700">
                      {styleSettings.headingSize}px
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementStyle('headingSize')}
                      className="h-7 w-7 cursor-pointer rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Body
                    </span>
                    <button
                      type="button"
                      onClick={() => decrementStyle('bodySize')}
                      className="h-7 w-7 cursor-pointer rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="min-w-[42px] text-center text-xs text-gray-700">
                      {styleSettings.bodySize}px
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementStyle('bodySize')}
                      className="h-7 w-7 cursor-pointer rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={resetStyles}
                    className="cursor-pointer rounded-md bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Reset Sizes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="h-[calc(100vh-220px)] overflow-auto rounded-xl bg-gray-100 p-4 ">
          {showEdit && (
            <div className="flex justify-center">
              <div className="mb-6 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm w-[8.5in]">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={currResume.title || ''}
                      onChange={(e) =>
                        commitTopLevelField('title', e.target.value)
                      }
                      placeholder="Enter resume title..."
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Company
                    </label>
                    <input
                      type="text"
                      value={currResume.targetCompany || ''}
                      onChange={(e) =>
                        commitTopLevelField('targetCompany', e.target.value)
                      }
                      placeholder="Enter resume title..."
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Job Link
                    </label>
                    <input
                      type="text"
                      value={currResume.jobLink || ''}
                      onChange={(e) =>
                        commitTopLevelField('targetCompany', e.target.value)
                      }
                      placeholder="Paste job link..."
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                    />
                  </div>
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
                  <h1
                    key="resume-name"
                    contentEditable={showEdit}
                    suppressContentEditableWarning
                    spellCheck={false}
                    style={{ fontSize: `${styleSettings.nameSize}px` }}
                    className={`font-bold tracking-wide whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                      'name',
                    )}`}
                    onFocus={() => setActiveEditor('name')}
                    onKeyDown={handlePlainTextKeyDown}
                    onBlur={(e) =>
                      commitTopLevelField(
                        'name',
                        e.currentTarget.textContent || '',
                      )
                    }
                  >
                    {draftResume?.name || ''}
                  </h1>

                  <p
                    key="resume-header"
                    contentEditable={showEdit}
                    suppressContentEditableWarning
                    spellCheck={false}
                    style={{ fontSize: `${styleSettings.bodySize + 1}px` }}
                    className={`leading-[1.3] whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                      'header',
                    )}`}
                    onFocus={() => setActiveEditor('header')}
                    onKeyDown={handlePlainTextKeyDown}
                    onBlur={(e) =>
                      commitRichField('header', e.currentTarget.innerHTML)
                    }
                    dangerouslySetInnerHTML={asHtml(draftResume?.header)}
                  />

                  <p
                    key="resume-contact"
                    contentEditable={showEdit}
                    suppressContentEditableWarning
                    spellCheck={false}
                    style={{ fontSize: `${styleSettings.bodySize + 1}px` }}
                    className={`leading-[1.3] whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                      'contact',
                    )}`}
                    onFocus={() => setActiveEditor('contact')}
                    onKeyDown={handlePlainTextKeyDown}
                    onBlur={(e) =>
                      commitRichField('contact', e.currentTarget.innerHTML)
                    }
                    dangerouslySetInnerHTML={asHtml(draftResume?.contact)}
                  />

                  <p
                    key="resume-portfolio"
                    contentEditable={showEdit}
                    suppressContentEditableWarning
                    spellCheck={false}
                    style={{ fontSize: `${styleSettings.bodySize + 1}px` }}
                    className={`leading-[1.3] whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                      'portfolio',
                    )}`}
                    onFocus={() => setActiveEditor('portfolio')}
                    onKeyDown={handlePlainTextKeyDown}
                    onBlur={(e) =>
                      commitRichField('portfolio', e.currentTarget.innerHTML)
                    }
                    dangerouslySetInnerHTML={asHtml(draftResume?.portfolio)}
                  />
                </header>

                <section className="mt-1.5">
                  <h2
                    className="font-bold tracking-wider"
                    style={{ fontSize: `${styleSettings.headingSize}px` }}
                  >
                    Summary
                  </h2>
                  <div
                    key="resume-summary"
                    contentEditable={showEdit}
                    suppressContentEditableWarning
                    spellCheck={false}
                    style={{ fontSize: `${styleSettings.bodySize}px` }}
                    className={`leading-[1.3] whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                      'summary',
                    )}`}
                    onFocus={() => setActiveEditor('summary')}
                    onKeyDown={handlePlainTextKeyDown}
                    onBlur={(e) =>
                      commitRichField('summary', e.currentTarget.innerHTML)
                    }
                    dangerouslySetInnerHTML={asHtml(draftResume?.summary)}
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
                    {draftResume?.skills?.length
                      ? draftResume.skills.map((skillGroup, index) => (
                          <p
                            key={`skill-group-${index}`}
                            style={{ fontSize: `${styleSettings.bodySize}px` }}
                            className="leading-[1.3]"
                          >
                            <span
                              contentEditable={showEdit}
                              suppressContentEditableWarning
                              spellCheck={false}
                              className={`font-semibold whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                                `skill-category-${index}`,
                              )}`}
                              onFocus={() =>
                                setActiveEditor(`skill-category-${index}`)
                              }
                              onKeyDown={handlePlainTextKeyDown}
                              onBlur={(e) =>
                                commitSkillCategory(
                                  index,
                                  e.currentTarget.textContent || '',
                                )
                              }
                            >
                              {skillGroup.category || ''}
                            </span>
                            :{' '}
                            <span
                              contentEditable={showEdit}
                              suppressContentEditableWarning
                              spellCheck={false}
                              className={`whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                                `skill-items-${index}`,
                              )}`}
                              onFocus={() =>
                                setActiveEditor(`skill-items-${index}`)
                              }
                              onKeyDown={handlePlainTextKeyDown}
                              onBlur={(e) =>
                                commitSkillItems(
                                  index,
                                  e.currentTarget.textContent || '',
                                )
                              }
                            >
                              {skillGroup.items?.join(', ') || ''}
                            </span>
                          </p>
                        ))
                      : null}
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
                    {draftResume?.experience?.length
                      ? draftResume.experience.map((job, index) => (
                          <div key={`experience-${index}`} className="relative">
                            <div className="flex items-start justify-between gap-4">
                              <p
                                contentEditable={showEdit}
                                suppressContentEditableWarning
                                spellCheck={false}
                                style={{
                                  fontSize: `${styleSettings.bodySize}px`,
                                }}
                                className={`font-bold leading-[1.3] whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                                  `job-company-${index}`,
                                )}`}
                                onFocus={() =>
                                  setActiveEditor(`job-company-${index}`)
                                }
                                onKeyDown={handlePlainTextKeyDown}
                                onBlur={(e) =>
                                  commitExperienceField(
                                    index,
                                    'company',
                                    e.currentTarget.innerHTML,
                                  )
                                }
                                dangerouslySetInnerHTML={asHtml(job?.company)}
                              />

                              <p
                                contentEditable={showEdit}
                                suppressContentEditableWarning
                                spellCheck={false}
                                style={{
                                  fontSize: `${styleSettings.bodySize}px`,
                                }}
                                className={`font-bold leading-[1.3] whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                                  `job-date-${index}`,
                                )}`}
                                onFocus={() =>
                                  setActiveEditor(`job-date-${index}`)
                                }
                                onKeyDown={handlePlainTextKeyDown}
                                onBlur={(e) =>
                                  commitExperienceField(
                                    index,
                                    'date',
                                    e.currentTarget.innerHTML,
                                  )
                                }
                                dangerouslySetInnerHTML={asHtml(job?.date)}
                              />
                            </div>

                            <p
                              contentEditable={showEdit}
                              suppressContentEditableWarning
                              spellCheck={false}
                              style={{
                                fontSize: `${styleSettings.bodySize}px`,
                              }}
                              className={`italic leading-tight whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                                `job-role-${index}`,
                              )}`}
                              onFocus={() =>
                                setActiveEditor(`job-role-${index}`)
                              }
                              onKeyDown={handlePlainTextKeyDown}
                              onBlur={(e) =>
                                commitExperienceField(
                                  index,
                                  'role',
                                  e.currentTarget.innerHTML,
                                )
                              }
                              dangerouslySetInnerHTML={asHtml(job?.role)}
                            />

                            <ul
                              style={{
                                fontSize: `${styleSettings.bodySize}px`,
                              }}
                              className="mt-[2px] list-disc pl-4 leading-[1.3]"
                            >
                              {job?.bullets?.length
                                ? job.bullets.map((bullet, bulletIndex) => (
                                    <li
                                      key={`job-bullet-${index}-${bulletIndex}-${bullet}`}
                                      className="group relative"
                                    >
                                      <span
                                        contentEditable={showEdit}
                                        suppressContentEditableWarning
                                        spellCheck={false}
                                        className={`block whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                                          `job-bullet-${index}-${bulletIndex}`,
                                        )}`}
                                        onFocus={() =>
                                          setActiveEditor(
                                            `job-bullet-${index}-${bulletIndex}`,
                                          )
                                        }
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
                                        onBlur={(e) =>
                                          commitBullet(
                                            index,
                                            bulletIndex,
                                            e.currentTarget.innerHTML,
                                          )
                                        }
                                        dangerouslySetInnerHTML={asHtml(bullet)}
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
                                  ))
                                : null}
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
                        ))
                      : null}
                  </div>
                </section>

                <section className="mt-1">
                  <h2
                    className="font-bold tracking-wider"
                    style={{ fontSize: `${styleSettings.headingSize}px` }}
                  >
                    Education
                  </h2>

                  <div className="flex justify-between gap-4">
                    <p
                      key="education-name"
                      contentEditable={showEdit}
                      suppressContentEditableWarning
                      spellCheck={false}
                      style={{ fontSize: `${styleSettings.bodySize}px` }}
                      className={`font-bold leading-[1.3] whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                        'education',
                      )}`}
                      onFocus={() => setActiveEditor('education')}
                      onKeyDown={handlePlainTextKeyDown}
                      onBlur={(e) =>
                        commitRichField('education', e.currentTarget.innerHTML)
                      }
                      dangerouslySetInnerHTML={asHtml(draftResume?.education)}
                    />

                    <p
                      key="education-location"
                      contentEditable={showEdit}
                      suppressContentEditableWarning
                      spellCheck={false}
                      style={{ fontSize: `${styleSettings.bodySize}px` }}
                      className={`font-bold leading-[1.3] whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                        'edu_location',
                      )}`}
                      onFocus={() => setActiveEditor('edu_location')}
                      onKeyDown={handlePlainTextKeyDown}
                      onBlur={(e) =>
                        commitRichField(
                          'edu_location',
                          e.currentTarget.innerHTML,
                        )
                      }
                      dangerouslySetInnerHTML={asHtml(
                        draftResume?.edu_location,
                      )}
                    />
                  </div>

                  <p
                    key="education-desc"
                    contentEditable={showEdit}
                    suppressContentEditableWarning
                    spellCheck={false}
                    style={{ fontSize: `${styleSettings.bodySize}px` }}
                    className={`italic leading-[1.3] whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                      'edu_desc',
                    )}`}
                    onFocus={() => setActiveEditor('edu_desc')}
                    onKeyDown={handlePlainTextKeyDown}
                    onBlur={(e) =>
                      commitRichField('edu_desc', e.currentTarget.innerHTML)
                    }
                    dangerouslySetInnerHTML={asHtml(draftResume?.edu_desc)}
                  />

                  <p
                    key="education-honors"
                    contentEditable={showEdit}
                    suppressContentEditableWarning
                    spellCheck={false}
                    style={{ fontSize: `${styleSettings.bodySize}px` }}
                    className={`italic leading-[1.3] whitespace-pre-wrap break-words ${editableClass} ${activeHighlight(
                      'edu_honors',
                    )}`}
                    onFocus={() => setActiveEditor('edu_honors')}
                    onKeyDown={handlePlainTextKeyDown}
                    onBlur={(e) =>
                      commitRichField('edu_honors', e.currentTarget.innerHTML)
                    }
                    dangerouslySetInnerHTML={asHtml(draftResume?.edu_honors)}
                  />
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
