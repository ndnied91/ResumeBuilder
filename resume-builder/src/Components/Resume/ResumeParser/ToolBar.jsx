import { MdModeEdit } from 'react-icons/md';
import { FaTrashCan } from 'react-icons/fa6';

const runCommand = (command, value = null) => {
  // Use <b>/<i>/<u> tags instead of inline style spans (Firefox default)
  document.execCommand('styleWithCSS', false, false);
  document.execCommand(command, false, value);
};

const FORMAT_BUTTONS = [
  { label: 'Bold', command: 'bold' },
  { label: 'Italic', command: 'italic' },
  { label: 'Underline', command: 'underline' },
];

const SIZE_CONTROLS = [
  { label: 'Name', field: 'nameSize' },
  { label: 'Headings', field: 'headingSize' },
  { label: 'Body', field: 'bodySize' },
];

const SizeControl = ({ label, value, onDecrement, onIncrement }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-medium text-gray-600">{label}</span>
    <button
      type="button"
      onClick={onDecrement}
      className="h-7 w-7 cursor-pointer rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      -
    </button>
    <span className="min-w-10.5 text-center text-xs text-gray-700">
      {value}px
    </span>
    <button
      type="button"
      onClick={onIncrement}
      className="h-7 w-7 cursor-pointer rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      +
    </button>
  </div>
);

const ToolBar = ({
  showEdit,
  isBusy,
  isSaving,
  updateResume,
  setShowDeleteModal,
  styleSettings,
  incrementStyle,
  decrementStyle,
  resetStyles,
}) => {
  if (!showEdit) return null;

  return (
    <div className="mb-4 flex w-full items-start justify-between gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={updateResume}
          disabled={isBusy}
          className={`flex h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
            isBusy
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'cursor-pointer bg-gray-900 text-white hover:bg-gray-700'
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
            isBusy
              ? 'cursor-not-allowed bg-red-300 text-white'
              : 'cursor-pointer border border-red-200 bg-white text-red-700 hover:bg-red-100'
          }`}
        >
          <FaTrashCan size={16} />
          Delete Resume
        </button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
        {FORMAT_BUTTONS.map(({ label, command }) => (
          <button
            key={command}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              runCommand(command);
            }}
            className="cursor-pointer rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            {label}
          </button>
        ))}

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
        {SIZE_CONTROLS.map(({ label, field }) => (
          <SizeControl
            key={field}
            label={label}
            value={styleSettings[field]}
            onDecrement={() => decrementStyle(field)}
            onIncrement={() => incrementStyle(field)}
          />
        ))}

        <button
          type="button"
          onClick={resetStyles}
          className="cursor-pointer rounded-md bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
        >
          Reset Sizes
        </button>
      </div>
    </div>
  );
};

export default ToolBar;
