import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <section className="surface w-full max-w-md rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-coral/10 text-coral">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>
            </div>
          </div>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onCancel} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="button" disabled={loading} onClick={onConfirm} className="bg-coral hover:bg-red-600">{confirmLabel}</Button>
        </div>
      </section>
    </div>
  );
}
