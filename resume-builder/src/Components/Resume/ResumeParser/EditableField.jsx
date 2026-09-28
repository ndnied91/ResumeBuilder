import { useLayoutEffect, useRef } from 'react';
import { sanitizeHtml, handlePlainTextKeyDown, EDITABLE_CLASS } from './utils';

const EditableField = ({
  as: Tag = 'p',
  value,
  onCommit,
  editable,
  rich = true,
  fontSize,
  className = '',
  onKeyDown = handlePlainTextKeyDown,
}) => {
  const ref = useRef(null);

  // Put the value into the element ourselves, but never while it's being edited
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;

    if (rich) {
      const html = sanitizeHtml(value);
      if (el.innerHTML !== html) el.innerHTML = html;
    } else {
      const text = value || '';
      if (el.textContent !== text) el.textContent = text;
    }
  }, [value, rich]);

  return (
    <Tag
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={false}
      style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
      className={`whitespace-pre-wrap wrap-break-word ${editable ? EDITABLE_CLASS : ''} ${className}`}
      onKeyDown={onKeyDown}
      onBlur={(e) =>
        onCommit(
          rich ? e.currentTarget.innerHTML : e.currentTarget.textContent || '',
        )
      }
    />
  );
};

export default EditableField;
