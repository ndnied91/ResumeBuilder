import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAppContext } from '../../context/useAppContext';
import { MdModeEdit } from 'react-icons/md';
import { FaRegFilePdf } from 'react-icons/fa6';
import { LuSaveAll } from 'react-icons/lu';
import { useUser, useAuth } from '@clerk/clerk-react';
import { FormatPreview } from './ResumePreview';
import { EditResume } from './EditResume';
import { blankResume, mapResumeToState } from '../../utils/helper';
import { IoMdAdd } from 'react-icons/io';

export const Resume = () => {
  const resumeRef = useRef(null);
  const { currResume, setCurrResume, allResumes } = useAppContext();
  const [showEdit, setShowEdit] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${currResume?.name?.replace(/\s+/g, '_') || 'Resume'}`,
  });

  const handleSafePrint = () => {
    if (!currResume || !currResume.name) return;
    handlePrint();
  };

  const handleSelectResume = (resumeId) => {
    const found = allResumes.find((r) => r.id === resumeId);

    if (!found) return;

    const mapped = mapResumeToState(found);
    setCurrResume(mapped);
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 p-6 scroll-auto">
      <div className="mx-auto flex h-full max-w-8xl flex-col">
        {/* Header / Actions */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Resume Builder</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Format Resume
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Edit your content and preview the final resume side by side.
            </p>
          </div>

          {/* Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={currResume?.resumeId || ''}
              onChange={(e) => handleSelectResume(e.target.value)}
              className="h-11 min-w-[190px] rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
            >
              <option value="" disabled>
                Select Resume
              </option>

              {allResumes?.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.title || 'Untitled Resume'}
                </option>
              ))}
            </select>

            {showEdit ? (
              <button
                type="button"
                onClick={() => setCurrResume(blankResume)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
              >
                <IoMdAdd size={18} />
                Create New
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setShowEdit((prev) => !prev)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              <MdModeEdit size={18} />
              {showEdit ? 'Hide Editor' : 'Show Editor'}
            </button>

            <button
              type="button"
              onClick={handleSafePrint}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-gray-900 border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
            >
              <FaRegFilePdf size={18} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Main Layout */}
        {currResume.resumeId !== undefined ? (
          <div
            className={`grid min-h-0 flex-1 gap-6 ${
              showEdit
                ? 'lg:grid-cols-[clamp(400px,35vw,700px)_minmax(0,1fr)]'
                : 'lg:grid-cols-1'
            }`}
          >
            {/* Left editor */}
            {showEdit && <EditResume updateField />}

            {/* Right preview */}
            <FormatPreview showEdit={showEdit} resumeRef={resumeRef} />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center ">
            <div className="flex flex-col items-center gap-3">
              {/* Spinner */}
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />

              {/* Text */}
              <p className="text-black font-medium">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
