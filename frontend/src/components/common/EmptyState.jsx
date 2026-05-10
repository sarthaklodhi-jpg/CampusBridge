import { Sparkles } from "lucide-react";

export default function EmptyState({ title, message }) {
  return (
    <div className="surface rounded-lg p-8 text-center">
      <Sparkles className="mx-auto h-9 w-9 text-brand-600" />
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
