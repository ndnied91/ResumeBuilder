export const Input = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
}) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={(e) => onBlur(name, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
      />
    </label>
  );
};
