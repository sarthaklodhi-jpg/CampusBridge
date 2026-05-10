import { ArrowRight, Globe2, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <span className="text-xl font-extrabold">Campus<span className="text-brand-600">Bridge</span></span>
        <div className="flex gap-2">
          <Link className="btn-ghost" to="/login">Login</Link>
          <Link className="btn-primary" to="/register">Join</Link>
        </div>
      </nav>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Verified student communities</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-6xl">CampusBridge</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            A modern social layer for colleges where students ask questions, share resources, build networks, and discover public cross-college knowledge.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/register">Start your campus <ArrowRight className="h-4 w-4" /></Link>
            <Link className="btn-ghost" to="/login">I have an account</Link>
          </div>
        </div>
        <div className="surface rounded-lg p-5">
          <div className="grid gap-4">
            {[
              ["Private college ecosystems", UsersRound],
              ["Public academic discussions", Globe2],
              ["Verified join-code access", ShieldCheck]
            ].map(([title, Icon]) => (
              <div key={title} className="rounded-lg border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <Icon className="h-6 w-6 text-brand-600" />
                <h2 className="mt-4 font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Designed for structured collaboration without losing the energy of a live student network.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
