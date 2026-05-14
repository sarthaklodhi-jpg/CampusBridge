import { AnimatePresence, motion } from "framer-motion";
import { Building2, CalendarDays, FileText, Megaphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { searchApi } from "../api/endpoints";
import SearchBar from "../components/common/SearchBar";
import EmptyState from "../components/common/EmptyState";
import UserCard from "../components/profile/UserCard";
import PostCard from "../components/feed/PostCard";
import { useDebounce } from "../hooks/useDebounce";
import Skeleton from "../components/common/Skeleton";

const emptyResults = { users: [], posts: [], colleges: [], announcements: [], resources: [], events: [] };

function Highlight({ text = "", query }) {
  const parts = useMemo(() => {
    const value = String(text || "");
    const term = query.trim();
    if (!term) return [value];
    return value.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  }, [text, query]);

  return parts.map((part, index) =>
    part.toLowerCase() === query.trim().toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-brand-100 px-0.5 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

function ResultSection({ title, count, children }) {
  if (!count) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{count}</span>
      </div>
      {children}
    </section>
  );
}

function CompactResultCard({ icon: Icon, title, meta, description, query, to }) {
  const content = (
    <div className="surface rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 dark:text-white"><Highlight text={title} query={query} /></p>
          {meta && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{meta}</p>}
          {description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300"><Highlight text={description} query={query} /></p>}
        </div>
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(emptyResults);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounced = useDebounce(q, 300);
  const trimmed = debounced.trim();

  const resultCount = Object.values(results).reduce((total, group) => total + (group?.length || 0), 0);

  useEffect(() => {
    if (!trimmed) {
      setResults(emptyResults);
      setLoading(false);
      setSearched(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setSearched(true);

    searchApi
      .global({ q: trimmed, limit: 6 }, { signal: controller.signal })
      .then(({ data }) => {
        setResults({ ...emptyResults, ...data.data });
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") setResults(emptyResults);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [trimmed]);

  return (
    <div className="space-y-6">
      <div className="surface rounded-lg p-4 sm:p-5">
        <SearchBar value={q} onChange={setQ} placeholder="Search users, posts, colleges, announcements, resources, events..." autoFocus />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {["Users", "Posts", "Colleges", "Announcements", "Resources", "Events"].map((label) => (
            <span key={label} className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">{label}</span>
          ))}
        </div>
      </div>

      {!q && <EmptyState title="Search the network" message="Find students, posts, colleges, announcements, resources, and events across your accessible ecosystem." />}

      {loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton lines={2} />
          <Skeleton lines={2} />
        </div>
      )}

      {!loading && searched && !resultCount && <EmptyState title="No results found" message="Try a name, college, post topic, event title, or resource keyword." />}

      <AnimatePresence mode="popLayout">
        {!loading && resultCount > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-7">
            <ResultSection title="Users" count={results.users.length}>
              <div className="grid gap-3 sm:grid-cols-2">{results.users.map((user) => <UserCard key={user._id} user={user} />)}</div>
            </ResultSection>

            <ResultSection title="Posts" count={results.posts.length}>
              <div className="space-y-4">{results.posts.map((post) => <PostCard key={post._id} post={post} />)}</div>
            </ResultSection>

            <ResultSection title="Colleges" count={results.colleges.length}>
              <div className="grid gap-3 md:grid-cols-2">
                {results.colleges.map((college) => (
                  <CompactResultCard key={college._id} icon={Building2} title={college.name} description={college.description} meta={`${college.studentsCount || 0} students`} query={trimmed} />
                ))}
              </div>
            </ResultSection>

            <ResultSection title="Announcements" count={results.announcements.length}>
              <div className="grid gap-3 md:grid-cols-2">
                {results.announcements.map((announcement) => (
                  <CompactResultCard key={announcement._id} icon={Megaphone} title={announcement.title} description={announcement.content} meta={announcement.priority} query={trimmed} />
                ))}
              </div>
            </ResultSection>

            <ResultSection title="Resources" count={results.resources.length}>
              <div className="grid gap-3 md:grid-cols-2">
                {results.resources.map((resource) => (
                  <CompactResultCard key={resource._id} icon={FileText} title={resource.title} description={resource.description || resource.category} meta={resource.resourceType} query={trimmed} />
                ))}
              </div>
            </ResultSection>

            <ResultSection title="Events" count={results.events.length}>
              <div className="grid gap-3 md:grid-cols-2">
                {results.events.map((event) => (
                  <CompactResultCard key={event._id} icon={CalendarDays} title={event.title} description={event.description || event.location} meta={event.startsAt ? new Date(event.startsAt).toLocaleDateString() : event.type} query={trimmed} />
                ))}
              </div>
            </ResultSection>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
