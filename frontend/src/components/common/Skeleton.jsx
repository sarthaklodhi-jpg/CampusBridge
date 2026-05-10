export default function Skeleton({ lines = 3 }) {
  return (
    <div className="surface rounded-lg p-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-1/5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>
  );
}
