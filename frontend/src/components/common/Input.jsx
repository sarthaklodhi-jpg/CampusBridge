export default function Input({ label, error, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>}
      <input className="input" {...props} />
      {error && <span className="mt-2 block text-sm text-coral">{error}</span>}
    </label>
  );
}
