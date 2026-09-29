import { useEffect, useRef, useState } from 'react';
import { MdModeEdit } from 'react-icons/md';
import { FaTrashCan } from 'react-icons/fa6';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/70';

const FORMAT_BUTTONS = [
  {
    label: 'Bold',
    command: 'bold',
    shortcut: 'Control+B Meta+B',
    hint: '⌘/Ctrl+B',
  },
  {
    label: 'Italic',
    command: 'italic',
    shortcut: 'Control+I Meta+I',
    hint: '⌘/Ctrl+I',
  },
  {
    label: 'Underline',
    command: 'underline',
    shortcut: 'Control+U Meta+U',
    hint: '⌘/Ctrl+U',
  },
];

// Find the editable field a range lives in (if any)
const getEditableFromRange = (range) => {
  const node = range.commonAncestorContainer;
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return el?.closest('[contenteditable="true"]') || null;
};

const runCommand = (command, value = null) => {
  // Use <b>/<i>/<u> tags instead of inline style spans (Firefox default)
  document.execCommand('styleWithCSS', false, false);
  document.execCommand(command, false, value);
};

const ToolBar = ({
  showEdit,
  isBusy,
  isSaving,
  updateResume,
  setShowDeleteModal,
}) => {
  // Hooks must run before the early return
  const savedRange = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});

  // Remember the last selection inside an editable field, and which formats it has
  useEffect(() => {
    if (!showEdit) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      const range = selection.getRangeAt(0);
      if (!getEditableFromRange(range)) return;

      savedRange.current = range.cloneRange();
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () =>
      document.removeEventListener('selectionchange', handleSelectionChange);
  }, [showEdit]);

  // Put the saved selection back (needed when using the keyboard), then format it
  const applyFormat = (command, value = null) => {
    const range = savedRange.current;
    const editable = range && getEditableFromRange(range);
    if (!editable) return;

    editable.focus();
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    runCommand(command, value);
  };

  const handleLink = () => {
    const url = window.prompt('Enter URL');
    if (url) applyFormat('createLink', url);
  };

  if (!showEdit) return null;

  return (
    <div className="mb-4 flex w-full items-start justify-between gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={updateResume}
          disabled={isBusy}
          aria-busy={isSaving}
          className={`flex h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${focusRing} ${
            isBusy
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'cursor-pointer bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          {isSaving ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
              Saving...
            </>
          ) : (
            <>
              <MdModeEdit size={16} aria-hidden="true" />
              Save Resume
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          disabled={isBusy}
          className={`flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition ${focusRing} ${
            isBusy
              ? 'cursor-not-allowed bg-red-300 text-white'
              : 'cursor-pointer border border-red-200 bg-white text-red-700 hover:bg-red-100'
          }`}
        >
          <FaTrashCan size={16} aria-hidden="true" />
          Delete Resume
        </button>
      </div>

      <div
        role="group"
        aria-label="Text formatting"
        className="flex gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2"
      >
        {FORMAT_BUTTONS.map(({ label, command, shortcut, hint }) => (
          <button
            key={command}
            type="button"
            // Keep the text selected when clicking with a mouse
            onMouseDown={(e) => e.preventDefault()}
            // Runs for mouse clicks AND Enter/Space from the keyboard
            onClick={() => applyFormat(command)}
            aria-pressed={Boolean(activeFormats[command])}
            aria-keyshortcuts={shortcut}
            title={`${label} (${hint})`}
            className={`cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition ${focusRing} ${
              activeFormats[command]
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleLink}
          className={`cursor-pointer rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-100 ${focusRing}`}
        >
          Link
        </button>
      </div>
    </div>
  );
};

export default ToolBar;
