import { MdModeEdit } from 'react-icons/md';
import { FaRegFilePdf } from 'react-icons/fa6';
import { FaRegCopy } from 'react-icons/fa';
import { useAppContext } from '../../../context/useAppContext';
import { mapResumeToState } from '../../../utils/helper';

const Header = ({
  showEdit,
  setShowEdit,
  handleDuplicate,
  isBusy,
  isOverflowing,
  handleSafePrint,
}) => {
  const { currResume, setCurrResume, allResumes } = useAppContext();

  const handleSelectResume = (resumeId) => {
    const found = allResumes.find((r) => (r.resumeId || r.id) === resumeId);
    if (!found) return;
    setCurrResume(mapResumeToState(found));
  };

  return (
    <section className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Format Resume</h1>
        <p className="mt-2 text-sm text-gray-600">
          Edit your content and preview the final resume side by side.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={currResume?.resumeId || currResume?.id || ''}
          onChange={(e) => handleSelectResume(e.target.value)}
          className="h-11 min-w-47.5 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
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
              {resume.createdAt &&
                ` · ${new Date(resume.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}`}
            </option>
          ))}
        </select>

        {showEdit && (
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={isBusy}
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:hover:border-gray-200 disabled:hover:bg-gray-100"
          >
            <FaRegCopy size={18} />
            Duplicate
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowEdit((prev) => !prev)}
          title={isOverflowing ? 'Resume runs past one page' : undefined}
          className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition ${
            isOverflowing
              ? 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <MdModeEdit size={18} />
          {showEdit ? 'Hide Editor' : 'Show Editor'}
        </button>

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
    </section>
  );
};

export default Header;
