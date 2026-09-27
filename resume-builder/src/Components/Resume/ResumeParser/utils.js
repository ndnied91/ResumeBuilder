import DOMPurify from 'dompurify';

export const EDITABLE_CLASS =
  'rounded outline-none transition hover:bg-yellow-50 focus:bg-yellow-50';

const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'a', 'br'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
};

export const sanitizeHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html, RICH_TEXT_CONFIG)
    .replace(/&nbsp;/g, ' ')
    .replace(/(<br\s*\/?>\s*)+$/i, '')
    .trim();
};

export const sanitizeText = (value) => {
  if (!value) return '';
  return value
    .replace(/\u00A0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const asHtml = (value) => ({ __html: sanitizeHtml(value) });

export const handlePlainTextKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.execCommand('insertLineBreak');
  }
};
