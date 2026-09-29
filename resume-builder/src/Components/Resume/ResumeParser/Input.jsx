import { useId } from 'react';

export const Input = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  hint,
  required = false,
  autoComplete,
}) => {
  const hintId = useId();

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-gray-500"> (required)</span>}
      </span>

      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={(e) => onBlur(name, e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-required={required || undefined}
        aria-describedby={hint ? hintId : undefined}
        autoComplete={autoComplete}
        inputMode={type === 'url' ? 'url' : undefined}
        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/20"
      />

      {hint && (
        <span id={hintId} className="text-xs text-gray-500">
          {hint}
        </span>
      )}
    </label>
  );
};
