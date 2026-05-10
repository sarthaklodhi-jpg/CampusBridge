import { Link } from "react-router-dom";

export default function AuthCard({ title, subtitle, children, footerText, footerLink, footerLabel }) {
  return (
    <section className="surface w-full max-w-md rounded-lg p-6 sm:p-8">
      <Link to="/" className="text-xl font-extrabold">
        Campus<span className="text-brand-600">Bridge</span>
      </Link>
      <h1 className="mt-8 text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      <div className="mt-7">{children}</div>
      <p className="mt-6 text-center text-sm text-slate-500">
        {footerText}{" "}
        <Link className="font-bold text-brand-600 hover:text-brand-700" to={footerLink}>
          {footerLabel}
        </Link>
      </p>
    </section>
  );
}
