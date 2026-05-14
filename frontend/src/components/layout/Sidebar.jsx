import { BarChart3, Bell, Bookmark, Building2, CalendarDays, FileText, Flag, Globe2, Home, Megaphone, Network, Search, Settings, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthUser } from "../../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/feed/college", label: "College Feed", icon: Users },
  { to: "/feed/public", label: "Public Feed", icon: Globe2 },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/resources", label: "Resources", icon: FileText },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/search", label: "Search", icon: Search },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/college/manage", label: "College Management", icon: ShieldCheck, adminOnly: true },
  { to: "/moderation", label: "Moderation", icon: Flag, adminOnly: true },
  { to: "/analytics", label: "Analytics", icon: BarChart3, adminOnly: true }
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuthUser();
  const canManage = ["college_admin", "college_owner", "super_admin"].includes(user?.role);
  const visibleLinks = links.filter((link) => !link.adminOnly || canManage);

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-slate-950/40 transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} />
      <aside className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-72 border-r border-white/70 bg-white/90 p-4 backdrop-blur-xl transition lg:sticky lg:z-20 lg:block lg:translate-x-0 dark:border-slate-800 dark:bg-slate-950/90 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="rounded-lg bg-slate-100 p-4 ring-1 ring-transparent transition dark:bg-slate-900 dark:ring-slate-800/70">
          <div className="flex items-center gap-3">
            {user?.college ? <Network className="h-5 w-5 text-brand-600" /> : <Building2 className="h-5 w-5 text-brand-600" />}
            <div>
              <p className="text-sm font-bold">{user?.college?.name || "No college yet"}</p>
              <p className="text-xs font-semibold capitalize text-slate-500">{(user?.role || "student").replace("_", " ")}</p>
            </div>
          </div>
        </div>
        <nav className="mt-4 space-y-1">
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition duration-200 ${isActive ? "bg-brand-600 text-white shadow-soft ring-1 ring-brand-500/30" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"}`}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
