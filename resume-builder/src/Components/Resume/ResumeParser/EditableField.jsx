import { asHtml, handlePlainTextKeyDown, EDITABLE_CLASS } from './utils';

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
  const props = {
    contentEditable: editable,
    suppressContentEditableWarning: true,
    spellCheck: false,
    style: fontSize ? { fontSize: `${fontSize}px` } : undefined,
    className: `whitespace-pre-wrap break-words ${editable ? EDITABLE_CLASS : ''} ${className}`,
    onKeyDown,
    onBlur: (e) =>
      onCommit(
        rich ? e.currentTarget.innerHTML : e.currentTarget.textContent || '',
      ),
  };

  if (rich) {
    return <Tag {...props} dangerouslySetInnerHTML={asHtml(value)} />;
  }

  return <Tag {...props}>{value || ''}</Tag>;
};

export default EditableField;
