import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthActions, useAuthUser } from "../../context/AuthContext";

export default function Navbar({ onMenu }) {
  const { user } = useAuthUser();
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    document.documentElement.classList.toggle("light", !nextIsDark);
    document.documentElement.dataset.theme = nextIsDark ? "dark" : "light";
    try {
      localStorage.setItem("campusbridge-theme", nextIsDark ? "dark" : "light");
    } catch {
      // Theme still updates for the current session if storage is unavailable.
    }
    setDark(nextIsDark);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button className="btn-ghost px-3 lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/dashboard" className="text-lg font-extrabold tracking-tight">
          Campus<span className="text-brand-600">Bridge</span>
        </Link>
        <button onClick={() => navigate("/search")} className="ml-auto hidden min-w-72 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-left text-sm text-slate-500 transition hover:border-brand-500 hover:bg-white hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-brand-100 md:flex dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500 dark:hover:bg-slate-900/80 dark:hover:text-slate-200 dark:focus:ring-brand-500/20">
          <Search className="h-4 w-4" /> Search people, posts, colleges
        </button>
        <button className="btn-ghost px-3" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="btn-ghost px-3" onClick={() => navigate("/notifications")} aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>
        <button onClick={logout} className="hidden text-sm font-semibold text-slate-500 hover:text-slate-900 sm:block dark:hover:text-white">
          Logout
        </button>
        <Link to={`/profile/${user?.username}`} className="h-10 w-10 overflow-hidden rounded-full bg-brand-100">
          <img src={user?.profilePicture || `https://api.dicebear.com/9.x/initials/svg?seed=${user?.name || "CB"}`} alt="" className="h-full w-full object-cover" />
        </Link>
      </div>
    </header>
  );
}
